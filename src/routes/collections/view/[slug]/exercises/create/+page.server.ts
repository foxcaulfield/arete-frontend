import { fail, isRedirect, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";
import { ApiError } from "$lib/server/errors";
import { validateParams } from "$lib/server/form-utils";

export const load: PageServerLoad = async ({ params, parent }) => {
	const collectionId = params.slug;
	const { user } = await parent();

	if (!user) {
		return {
			serverData: null,
			flags: { unauthorized: true },
			collectionId,
		};
	}

	return {
		serverData: { user },
		flags: null,
		collectionId,
	};
};

export const actions = {
	create: async ({ request, fetch, params }) => {
		// Validate required params
		const paramError = validateParams(params, ["slug"]);
		if (paramError) {
			return fail(400, {
				errorText: paramError,
				errors: {},
				values: undefined,
			});
		}

		try {
			// Get and process form data
			const formData = await request.formData();

			// Add collection ID
			formData.append("collectionId", params.slug!);

			// Submit to backend
			const backend = new Backend(fetch);
			await backend.api.exercises.create(formData);

			// Redirect on success
			throw redirect(303, `/collections/view/${params.slug}?exerciseCreated=1`);
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
			console.error("Unexpected error during exercise creation:", error);
			return fail(500, {
				errors: {},
				values: {},
				errorText: error instanceof Error ? error.message : "An unexpected error occurred",
			});
		}
	},
} satisfies Actions;
