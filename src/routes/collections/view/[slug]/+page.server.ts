import { Backend } from "$lib/server/backend-manager";
// import { handleActionError, mapLoadError } from "$lib/server/error-utils";
// import { ok } from "$lib/server/error-utils";
import { redirect } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, fetch, parent }) => {
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
		const paginatedExercises = await backend.api.exercises.getListByCollectionId(collectionId);
		return {
			serverData: { collection, paginatedExercises },
			flags: null,
		};
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e); // may throw for unexpected
		return {
			serverData: { collection: null },
			flags,
		};
	}
};

export const actions = {
	delete: async ({ params, fetch }) => {
		try {
			const backend = new Backend(fetch);
			await backend.api.collections.delete(params.slug);
			throw redirect(303, "/collections?deleted=1");
		} catch (e) {
			const result = Backend.handleActionError(e, {
				// redirectToOn401: `/auth?redirectTo=${encodeURIComponent(url.pathname)}`,
			});
			return result;
		}
	},
};
