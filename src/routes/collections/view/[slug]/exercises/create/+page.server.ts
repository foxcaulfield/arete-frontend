import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";

const valueToString = (v: FormDataEntryValue) => String(v).trim();
const hasLength = (s: string) => s.length > 0;
const getAll = (formData: FormData, key: string) => formData.getAll(key).map(valueToString).filter(hasLength);
const getStrField = <T extends string>(formData: FormData, key: string): T =>
	String(formData.get(key) || "").trim() as T;

function parseExerciseForm(
	formData: FormData,
	collectionId: string
): { dto: CreateExerciseDTO | null; errors: Record<string, string> } {
	const errors: Record<string, string> = {};

	const values = {
		question: getStrField(formData, "question"),
		correctAnswer: getStrField(formData, "correctAnswer"),
		additionalCorrectAnswers: getAll(formData, "additionalCorrectAnswers"),
		exerciseType: getStrField<ExerciseType>(formData, "exercise-type"),
		distractors: getAll(formData, "distractors"),
		explanation: getStrField(formData, "explanation"),
		// image: formData.get("image") as File | null,
		// audio: formData.get("audio") as File | null,
	};

	const { additionalCorrectAnswers, exerciseType, question, correctAnswer, distractors, explanation } = values;

	// Question validation
	if (!question) {
		errors.question = "Question is required";
	} else if (question.length < 5) {
		errors.question = "Question must be at least 5 characters";
	} else if (question.length > 500) {
		errors.question = "Question must not exceed 500 characters";
	}

	if (!correctAnswer) {
		errors.correctAnswer = "Correct answer is required";
	} else if (correctAnswer.length < 1) {
		errors.correctAnswer = "Correct answer must be at least 1 character";
	} else if (correctAnswer.length > 50) {
		errors.correctAnswer = "Correct answer must not exceed 50 characters";
	}

	// Validate additional correct answers
	if (additionalCorrectAnswers.some((a) => a === correctAnswer)) {
		errors.additionalCorrectAnswers = "Additional correct answers cannot be the same as the main correct answer";
	}

	if (new Set(additionalCorrectAnswers).size !== additionalCorrectAnswers.length) {
		errors.additionalCorrectAnswers = "Additional correct answers must be unique";
	}

	for (const ans of additionalCorrectAnswers) {
		if (ans.length < 1 || ans.length > 50) {
			errors.additionalCorrectAnswers = "Each additional correct answer must be 1-50 characters";
		}
	}

	// Distractor validation
	if (distractors.some((d) => d === values.correctAnswer)) {
		errors.distractors = "Distractors cannot be the same as the correct answer";
	}

	if (additionalCorrectAnswers.some((a) => distractors.includes(a))) {
		errors.distractors = "Distractors cannot be the same as any additional correct answer";
	}

	if (new Set(distractors).size !== distractors.length) {
		errors.distractors = "Distractors must be unique";
	}

	for (const dist of distractors) {
		if (dist.length < 1 || dist.length > 50) {
			errors.distractors = "Each distractor must be 1-50 characters";
		}
	}

	if (exerciseType === "CHOICE_SINGLE") {
		if (distractors.length < 10) {
			errors.distractors = "At least 10 distractors are required for single-choice questions";
		}
	}

	// // Return early if validation failed
	// if (Object.keys(errors).length > 0) {
	// 	return { dto: values, errors };
	// }

	// Return fully typed and validated DTO
	const dto: CreateExerciseDTO = {
		type: exerciseType,
		collectionId,
		question,
		correctAnswer,
		additionalCorrectAnswers: additionalCorrectAnswers.length > 0 ? additionalCorrectAnswers : undefined,
		distractors: distractors.length > 0 ? distractors : undefined,
		explanation: explanation.length > 0 ? explanation : undefined,
	};

	return { dto, errors: errors };
}

export const load: PageServerLoad = async ({ params, parent }) => {
	const collectionId = params.slug;
	const { user } = await parent();

	if (!user) {
		return { serverData: null, flags: { unauthorized: true }, collectionId };
	}

	return { serverData: { user }, flags: null, collectionId };
};

export const actions = {
	create: async ({ request, fetch, params }) => {
		if (!params.slug) {
			return fail(400, {
				errorText: "Missing collection ID",
				errors: {} as Record<string, string>,
				values: undefined,
			});
		}

		const formData = await request.formData();
		const { dto: exerciseData, errors } = parseExerciseForm(formData, params.slug);

		// Return validation errors
		if ((errors && Object.keys(errors).length > 0) || !exerciseData) {
			return fail(400, {
				values: exerciseData,
				errorText: "Validation failed",
				errors,
			});
		}

		const outbound = createOutboundFormData(formData, exerciseData);

		try {
			const backend = new Backend(fetch);
			await backend.api.exercises.create(outbound);
			// console.log('Exercise created:', result);
			throw redirect(303, `/collections/view/${params.slug}?exerciseCreated=1`);
		} catch (error) {
			const result = Backend.handleActionError(error);

			return fail(result.status, {
				errorText: result?.data.message,
				errors: {} as Record<string, string>,
				values: exerciseData,
			});
		}
	},
} satisfies Actions;

function createOutboundFormData(formData: FormData, exerciseData: CreateExerciseDTO) {
	const outbound = new FormData();
	outbound.append("type", exerciseData.type);
	outbound.append("collectionId", exerciseData.collectionId);
	outbound.append("question", exerciseData.question);
	outbound.append("correctAnswer", exerciseData.correctAnswer);

	if (exerciseData.additionalCorrectAnswers?.length) {
		for (const extraAnswer of exerciseData.additionalCorrectAnswers) {
			outbound.append("additionalCorrectAnswers", extraAnswer);
		}
	}

	if (exerciseData.distractors?.length) {
		for (const extraAnswer of exerciseData.distractors) {
			outbound.append("distractors", extraAnswer);
		}
	}

	if (exerciseData.explanation) {
		outbound.append("explanation", exerciseData.explanation);
	}

	const rawImage = formData.get("image");
	const rawAudio = formData.get("audio");

	if (rawImage instanceof File) {
		outbound.append("image", rawImage, rawImage.name);
	}

	if (rawAudio instanceof File) {
		outbound.append("audio", rawAudio, rawAudio.name);
	}

	return outbound;
}
