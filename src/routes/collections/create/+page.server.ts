import { Backend } from "$lib/server/backend-manager";
import type { Actions, PageServerLoad } from "./$types";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/server/errors";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) return { serverData: null, flags: { unauthorized: true } };
	return { serverData: null, flags: null };
};

export const actions = {
	create: async ({ request, fetch }) => {
		// Get form data once at the start
		const data = await request.formData();
		const name = String(data.get("name") ?? "").trim();
		const description = (data.get("description")?.toString().trim() || undefined) as string | undefined;

		// Preserve values for re-rendering on fail
		const values = {
			name: data.get("name")?.toString() ?? "",
			description: data.get("description")?.toString() ?? "",
		};

		// Basic client-side validation
		if (!name) {
			return fail(400, {
				errorText: "Name is required",
				fieldErrors: { name: ["Name is required"] },
				values,
			});
		}

		try {
			const backend = new Backend(fetch);
			const result = await backend.api.collections.create(name, description);

			throw redirect(303, `/collections/view/${result.id}?created=1`);
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
						errorText: error.message || "Validation failed",
						fieldErrors: error.fields,
						values,
					});
				}

				// Other API errors (403, 404, etc.)
				return fail(error.statusCode, {
					errorText: error.message || "An error occurred",
					fieldErrors: {},
					values,
				});
			}

			// Unexpected errors
			console.error("Unexpected error during collection creation:", error);
			return fail(500, {
				errorText: error instanceof Error ? error.message : "An unexpected error occurred",
				fieldErrors: {},
				values,
			});
		}
	},
} satisfies Actions;
