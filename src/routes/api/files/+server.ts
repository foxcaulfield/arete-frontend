import type { RequestHandler } from "@sveltejs/kit";
import { Backend, CustomApiError } from "$lib/server/backend-manager";

export const GET: RequestHandler = async ({ fetch, url }) => {
	const queryParams = url.searchParams;

	const fileType = queryParams.get("type");
	const filename = queryParams.get("name");

	if (!fileType || !filename) {
		return new Response("File type and name are required", { status: 400 });
	}

	const backend = new Backend(fetch);
	try {
		const response = await backend.api.exercises.getFile(fileType, filename);
		// Forward the body and headers (preserve content-type, disposition, etc.)
		return new Response(response.body, { status: response.status, headers: response.headers });
	} catch (e) {
		if (e instanceof CustomApiError) {
			// Backend returned a structured API error
			return new Response(e.errorText || e.message, {
				status: e.requestStatusCode || 500,
				headers: { "Content-Type": "application/json" },
			});
		}
		// Unexpected error
		const msg = e instanceof Error ? e.message : String(e);
		return new Response(msg || "Internal server error", { status: 500 });
	}
};
