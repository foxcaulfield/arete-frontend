import { Backend } from "$lib/server/backend-manager";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, parent }) => {
	const { user } = await parent();

	if (!user) {
		return { serverData: null, flags: { unauthorized: true, errorText: "User not authenticated" } };
	}

	try {
		const backend = new Backend(fetch);
		const paginatedResponse = await backend.api.collections.all();
		return { serverData: { paginatedResponse }, flags: null };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e); // may throw for unexpected
		return { serverData: null, flags };
	}
};
