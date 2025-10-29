import { fail, isRedirect, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";
import { ApiError } from "$lib/server/errors";

export const load: PageServerLoad = async ({ params, parent }) => {
	const collectionId = params.slug;
	const { user } = await parent();

	if (!user) {
		return { serverData: null, flags: { unauthorized: true }, collectionId };
	}

	return { serverData: { user }, flags: null, collectionId };
};

export const actions = {
	create: async ({ request, fetch, params }) => {
		if (!params.slug) {
			return fail(400, {
				errorText: "Missing collection ID",
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
			// await backend.api.exercises.create(outbound);
			await backend.api.exercises.create(formData);
			throw redirect(303, `/collections/view/${params.slug}?exerciseCreated=1`);
		} catch (error) {
			// ?? Handle validation errors from backend// Handle redirect (not an error)
			if (isRedirect(error)) {
				throw error;
			}

			// Handle validation errors from NestJS
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
