import { Backend } from "$lib/server/backend-manager";
import { fail, isRedirect, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { ApiError } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
	const { id: exerciseId, slug: collectionId } = params;
	const { user } = await parent();

	if (!user) {
		return { serverData: null, flags: { unauthorized: true }, collectionId };
	}

	try {
		const backend = new Backend(fetch);
		const exercise = await backend.api.exercises.getById(exerciseId);

		return { exercise };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e);
		return { exercise: null, collectionId, flags }; // Handle error if needed
	}
};

export const actions = {
	update: async ({ request, fetch, params }) => {
		if (!params.slug) {
			return fail(400, {
				errorText: "Missing collection ID",
				errors: {} as Record<string, string>,
				values: undefined,
			});
		}
		if (!params.id) {
			return fail(400, {
				errorText: "Missing exercise ID",
				errors: {} as Record<string, string>,
				values: undefined,
			});
		}

		const formData = await request.formData();
		formData.append("collectionId", params.slug);
		formData.forEach((value, key) => {
			if (typeof value === "string" && value.trim().length === 0) {
				formData.delete(key);
			}
			if (value instanceof File && value.size === 0) {
				formData.delete(key);
			}
		});

		const arrayKeys = ["additionalCorrectAnswers", "distractors"] as const;
		// Collect array fields
		const arrayFields: Record<(typeof arrayKeys)[number], string[]> = {
			additionalCorrectAnswers: [],
			distractors: [],
		};

		const keyIsArrayField = (key: string): key is (typeof arrayKeys)[number] =>
			arrayKeys.includes(key as (typeof arrayKeys)[number]);

		// Extract array fields
		for (const [key, value] of [...formData.entries()]) {
			if (keyIsArrayField(key)) {
				if (typeof value === "string" && value.trim().length > 0) {
					arrayFields[key].push(value);
				}
				formData.delete(key);
			}
		}

		for (const key of arrayKeys) {
			arrayFields[key].forEach((value) => {
				formData.append(`${key}[]`, value);
			});
		}

		try {
			const backend = new Backend(fetch);
			// console.log(Object.keys(backend.api.exercises).join("")	);
			await backend.api.exercises.update(params.id, formData);
			throw redirect(303, `/collections/view/${params.slug}?exerciseUpdated=1`);
		} catch (error) {
			if (isRedirect(error)) {
				throw error;
			}

			if (error instanceof ApiError && typeof error === "object" && "statusCode" in error) {
				const apiError = error;

				// NestJS validation error with fields
				if (apiError.statusCode === 400 && apiError.fields) {
					return fail(400, {
						errors: apiError.fields as Record<string, string[]>,
						values: {},
						errorText: apiError.message || "Validation failed",
					});
				}

				// Other API errors
				return fail(apiError.statusCode || 500, {
					errors: {} as Record<string, string>,
					values: {},
					errorText: apiError.message || "An error occurred",
				});
			}

			// Network or other errors
			console.error("Unexpected error:", error);
			return fail(500, {
				errors: {} as Record<string, string>,
				values: {},
				errorText: error instanceof Error ? error.message : "An unexpected error occurred",
			});
		}
	},
} satisfies Actions;
