import { Backend } from "$lib/server/backend-manager";
import type { Handle, HandleFetch } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

/** Server hook that intercepts all INCOMING requests FIRST. */
export const handle: Handle = async ({ event, resolve }) => {
	const backendUrl = env.BACKEND_BASE_URL;
	if (!backendUrl) {
		throw new Error("BACKEND_BASE_URL environment variable is required but not set.");
	}

	event.locals.backendUrl = backendUrl;

	console.log("[hook] Backend URL:", backendUrl);

	// Continue with auth check for protected routes
	// Check if secure better-auth cookie exists

	if (!event.cookies.get("arete.session_token") && !event.cookies.get("__Secure-arete.session_token")) {
		event.locals.user = null;
		return resolve(event);
	}

	/** Tries to authenticate user via /me endpoint if cookie exists.
	 * If /me fails, just sets user to null instead of throwing. */
	try {
		const backend = new Backend(event.fetch);
		event.locals.user = await backend.api.auth.me();
	} catch (e) {
		event.locals.user = null;
		// Don't throw - just log and continue
		console.log("Auth check failed:", e instanceof Error ? e.message : String(e));
	}

	const response = await resolve(event);
	return response;
};

// Intercept OUTGOING fetch requests
// Fetch hook that adds cookies to requests to the backend
export const handleFetch: HandleFetch = async ({ event, request, fetch }) => {
	// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL; // Call dynamically each request
	const BACKEND_BASE_URL = event.locals.backendUrl;
	if (!BACKEND_BASE_URL) {
		throw new Error("BACKEND_BASE_URL environment variable is required but not set.");
	}
	if (request.url.startsWith(BACKEND_BASE_URL)) {
		// Add credentials and proper headers for cookie-based auth
		const headers = new Headers(request.headers);

		// Copy cookies from the incoming request
		const cookie = event.request.headers.get("cookie");
		if (cookie) {
			headers.set("cookie", cookie);
		}

		// Ensure credentials are included in the fetch
		return fetch(
			new Request(request, {
				headers,
				credentials: "include", // Important for cookies
			})
		);
	}
	return fetch(request);
};
