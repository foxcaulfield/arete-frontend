import { Backend } from "$lib/server/backend-manager";
import { log } from "console";
import type { LayoutServerLoad } from "./$types";

/**
 * Layout server load provides user data to all pages.
 * Client-side store will provide user data for navigation.
 */
export const load: LayoutServerLoad = async ({ locals, fetch, cookies }) => {
	// depends("app:auth");

	let user = locals.user || null;
	const backendUrl = locals.backendUrl || null; // Come from handle hook
	log("[layout] Load called. Backend URL (from handle hook) :", backendUrl);


	// Try to fetch user from backend if we have a cookie and no user in locals
	if (!user && (cookies.get("arete.session_token") || cookies.get("__Secure-arete.session_token"))) {
		try {
			console.log("[layout] Fetching user from backend...");
			const backend = new Backend(fetch);
			user = await backend.api.auth.me.bind(backend).call(backend);
			console.log("[layout] User loaded from backend:", user.email);
		} catch (error) {
			console.log(
				"[layout] Failed to fetch user from backend:",
				error instanceof Error ? error.message : String(error)
			);
			// Don't throw - let client-side store handle it
			user = null;
		}
	}

	return {
		user,
		// backendUrl,
	};
};
