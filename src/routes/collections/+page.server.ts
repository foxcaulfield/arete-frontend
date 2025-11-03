import { Backend } from "$lib/server/backend-manager";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent, url }) => {
	const urlParams = url.searchParams;
	const page = Math.max(1, parseInt(urlParams.get("page") || "1"));
	const limit = Math.max(1, parseInt(urlParams.get("limit") || "20"));

	const { user } = await parent();

	if (!user) {
		return {
			serverData: { collections: null, pagination: null },
			flags: { unauthorized: true },
		};
		// return
	}

	try {
		const backend = new Backend(fetch);
		const response = await backend.api.collections.list(page, limit);
		return {
			serverData: { collections: response.data, pagination: response.pagination },
			flags: null,
		};
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e); // may throw for unexpected
		return {
			serverData: { collections: null, pagination: null },
			flags,
		};
	}
};
