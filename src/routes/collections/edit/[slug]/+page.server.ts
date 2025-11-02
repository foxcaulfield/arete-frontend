import { Backend } from "$lib/server/backend-manager";
import { fail, isRedirect, redirect } from "@sveltejs/kit";
import { ApiError } from "$lib/server/errors";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, parent, fetch }) => {
	const collectionId = params.slug;

	const { user } = await parent();

	if (!user) {
		return {
			serverData: { collection: null },
			flags: { unauthorized: true },
		};
	}

	try {
		const backend = new Backend(fetch);
		const collection = await backend.api.collections.getById(collectionId);
		return { serverData: { collection }, flags: null };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e); // may throw for unexpected
		return { serverData: { collection: null }, flags };
	}
};

export const actions = {
	update: async ({ url, fetch, params, request }) => {
		const collectionId = params.slug;

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
			await backend.api.collections.update(collectionId, { name, description });

			const searchParams = new URLSearchParams(url.search);
			searchParams.set("updated", "1");
			const queryString = searchParams.toString();

			throw redirect(303, `/collections/view/${params.slug}${queryString ? `?${queryString}` : ""}`);
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
			console.error("Unexpected error during collection update:", error);
			return fail(500, {
				errorText: error instanceof Error ? error.message : "An unexpected error occurred",
				fieldErrors: {},
				values,
			});
		}
	},
} satisfies Actions;
