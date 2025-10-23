import { fail, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";

export const load: PageServerLoad = async ({ params, fetch }) => {
	const collectionId = params.slug;

	try {
		const backend = new Backend(fetch);
		const question = await backend.api.exercises.getDrillQuestion(collectionId);

		return { question, collectionId };
	} catch (e) {
		const flags = Backend.extractApiErrorFlags(e);
		return { question: null, collectionId, flags };
	}
};

export const actions = {
	getNextQuestion: async ({ params, fetch }) => {
		const collectionId = params.slug;
		if (!collectionId) {
			return fail(400, "Missing collection ID");
		}
		try {
			const backend = new Backend(fetch);
			const question = await backend.api.exercises.getDrillQuestion(collectionId);
			return { question };
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
