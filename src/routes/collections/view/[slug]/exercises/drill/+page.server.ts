import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";

export const load: PageServerLoad = async ({ params, fetch, cookies }) => {
	const collectionId = params.slug;

	// Read persisted preference from cookie (if present).
	// // Prefer a collection-scoped cookie but fall back to a global one.
	const key = `drill.forceTextInput.${collectionId ?? "global"}`;
	const raw = cookies.get(key) ?? cookies.get("drill.forceTextInput");
	const forceTextInput = raw === "true";

	try {
		const backend = new Backend(fetch);
		const question = await backend.api.exercises.getDrillQuestion(collectionId);

		return { question, collectionId, forceTextInput };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e);
		return { question: null, collectionId, flags, forceTextInput };
	}
};

export const actions = {
	getNextQuestion: async ({ params, fetch, cookies }) => {
		const collectionId = params.slug;
		if (!collectionId) {
			return fail(400, "Missing collection ID");
		}
		try {
			const backend = new Backend(fetch);
			const question = await backend.api.exercises.getDrillQuestion(collectionId);

			const key = `drill.forceTextInput.${collectionId ?? "global"}`;
			const raw = cookies.get(key) ?? cookies.get("drill.forceTextInput");
			const forceTextInput = raw === "true";
			return { question, forceTextInput };
		} catch (e) {
			const flags = Backend.extractApiErrorFlags(e);
			return fail(400, flags);
		}
	},
	handleSubmitAnswer: async ({ params, request, fetch }) => {
		const collectionId = params.slug;
		if (!collectionId) {
			return fail(400, "Missing collection ID");
		}
		try {
			const formData = await request.formData();
			const userAnswer = formData.get("userAnswer") as string;
			const exerciseId = formData.get("exerciseId") as string;

			if (!userAnswer?.trim() || !exerciseId) {
				return fail(400, "Answer or Exercise ID is missing");
			}

			const backend = new Backend(fetch);
			const response = await backend.api.exercises.submitDrillAnswer(collectionId, exerciseId, userAnswer);

			return response;
		} catch (e) {
			return Backend.handleActionError(e);
		} finally {
			// isSubmitting = false;
		}
	},
} satisfies Actions;
