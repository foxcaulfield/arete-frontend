import { Backend } from "$lib/server/backend-manager";
// import { handleActionError, mapLoadError, ok } from "$lib/server/error-utils";
import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";

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
		return { serverData: { collection }, flags: null};
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e); // may throw for unexpected
		return { serverData: { collection: null }, flags };
	}
};

export const actions = {
	update: async ({ url, fetch, params, request }) => {
		const collectionId = params.slug;
		const data = await request.formData();
		const name = data.get("name")?.toString();
		const description = data.get("description")?.toString();

		const values = { name, description };

		if (!name) {
			return fail(400, {
				message: "Name is required",
				fieldErrors: { name: "Required" },
				values,
			});
		}

		try {
			const backend = new Backend(fetch);
			await backend.api.collections.update(collectionId, values);

			const searchParams = new URLSearchParams(url.search);
			searchParams.set("updated", "1");
			const queryString = searchParams.toString();

			throw redirect(303, `/collections/view/${params.slug}${queryString ? `?${queryString}` : ""}`);
		} catch (e) {
			const result = Backend.handleActionError(e, {
				// redirectToOn401: `/auth?redirectTo=${encodeURIComponent(url.pathname)}`,
			});

			if ("data" in result && result.data) {
				result.data.values = values;
			}
			return result;
		}
	},
} satisfies Actions;
