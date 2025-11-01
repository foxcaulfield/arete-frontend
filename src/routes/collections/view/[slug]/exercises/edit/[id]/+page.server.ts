import { Backend } from "$lib/server/backend-manager";
import { fail, isRedirect, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ApiError } from "$lib/server/errors";
import { processExerciseFormData, validateParams } from "$lib/server/form-utils";

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
	const { id: exerciseId } = params;
	const { user } = await parent();

	if (!user) {
		return {
			exercise: null,
			flags: { unauthorized: true },
		};
	}

	// Validate params
	if (!exerciseId) {
		return {
			exercise: null,
			flags: { notFound: true, errorText: "Exercise ID is required" },
		};
	}

	try {
		const backend = new Backend(fetch);
		const exercise = await backend.api.exercises.getById(exerciseId);

		return { exercise };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e);
		return { exercise: null, flags };
	}
};

export const actions = {
	update: async ({ request, fetch, params }) => {
		// Validate required params
		const paramError = validateParams(params, ["slug", "id"]);
		if (paramError) {
			return fail(400, {
				errorText: paramError,
				errors: {},
				values: undefined,
			});
		}

		try {
			// Get and process form data
			const rawFormData = await request.formData();
			const formData = processExerciseFormData(rawFormData);

			// Submit to backend
			const backend = new Backend(fetch);
			await backend.api.exercises.update(params.id!, formData);

			// Redirect on success
			throw redirect(303, `/collections/view/${params.slug}?exerciseUpdated=1`);
		} catch (error) {
			// Handle redirect (not an error)
			if (isRedirect(error)) {
				throw error;
			}

			// Handle API errors
			if (error instanceof ApiError) {
				// Validation error with field-specific messages
				if (error.statusCode === 400 && error.fields) {
					return fail(400, {
						errors: error.fields,
						values: {},
						errorText: error.message || "Validation failed",
					});
				}

				// Other API errors (403, 404, etc.)
				return fail(error.statusCode, {
					errors: {},
					values: {},
					errorText: error.message || "An error occurred",
				});
			}

			// Unexpected errors
			console.error("Unexpected error during exercise update:", error);
			return fail(500, {
				errors: {},
				values: {},
				errorText: error instanceof Error ? error.message : "An unexpected error occurred",
			});
		}
	},
} satisfies Actions;
