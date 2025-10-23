import { Backend } from "$lib/server/backend-manager";
import type { Actions, PageServerLoad } from "./$types";
// import { ok } from "$lib/server/error-utils";
// import { handleActionError } from "$lib/server/error-utils";
import { fail, redirect } from "@sveltejs/kit";

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();
	if (!user) return { serverData: null, flags: { unauthorized: true } };
	return { serverData: null, flags: null };
};

export const actions = {
	create: async ({ request, fetch }) => {
		const data = await request.formData();
		const name = String(data.get("name") ?? "").trim();
		const description = (data.get("description")?.toString().trim() || undefined) as string | undefined;

		// Preserve values for re-rendering on fail
		const values = {
			name: data.get("name")?.toString() ?? "",
			description: data.get("description")?.toString() ?? "",
		};

		if (!name) {
			return fail(400, {
				message: "Name is required",
				fieldErrors: { name: "Required" },
				values,
			});
		}
		try {
			const backend = new Backend(fetch);
			const result = await backend.api.collections.create(name, description);

			throw redirect(303, `/collections/view/${result.id}?created=1`);
		} catch (e) {
			const result = Backend.handleActionError(e);
			// Attach values to preserve form state
			return fail(result.status, {
				message: result?.data.message,
				// fieldErrors: result?.data.values.fieldErrors,
				values,
			});
		}
	},
} satisfies Actions;
