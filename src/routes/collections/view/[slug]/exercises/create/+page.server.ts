import { fail, redirect, type Actions } from "@sveltejs/kit";
import type { PageServerLoad } from "./$types";
import { Backend } from "$lib/server/backend-manager";


// Validation rules (DRY)
const VALIDATION_RULES = {
    question: { min: 5, max: 500 },
    correctAnswer: { min: 1, max: 50 },
    explanation: { min: 0, max: 1000 },
} as const;


// Parse and validate form data into typed DTO
function parseExerciseForm(
    formData: FormData,
    collectionId: string
): { data: CreateExerciseDTO | null; errors: Record<string, string> } {
    const errors: Record<string, string> = {};
    const values = Object.fromEntries(formData.entries());

    // Question validation
    const question = String(values.question || "").trim();
    if (!question || question.length < VALIDATION_RULES.question.min) {
        errors.question = `Question must be at least ${VALIDATION_RULES.question.min} characters`;
    }
    if (question.length > VALIDATION_RULES.question.max) {
        errors.question = `Question must not exceed ${VALIDATION_RULES.question.max} characters`;
    }

    // Correct answer validation
    const correctAnswer = String(values.correctAnswer || "").trim();
    if (!correctAnswer || correctAnswer.length < VALIDATION_RULES.correctAnswer.min) {
        errors.correctAnswer = `Answer must be at least ${VALIDATION_RULES.correctAnswer.min} character`;
    }
    if (correctAnswer.length > VALIDATION_RULES.correctAnswer.max) {
        errors.correctAnswer = `Answer must not exceed ${VALIDATION_RULES.correctAnswer.max} characters`;
    }

    // Parse alternative answers (comma-separated form field)
    let alternativeAnswers: string[] = [];
    const altAnswersRaw = values.alternativeAnswers;
    if (typeof altAnswersRaw === "string" && altAnswersRaw.trim()) {
        alternativeAnswers = altAnswersRaw
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean);
    }

    // Parse tags (comma-separated form field)
    let tags: string[] = [];
    const tagsRaw = values.tags;
    if (typeof tagsRaw === "string" && tagsRaw.trim()) {
        tags = tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);
    }

    // Explanation validation
    const explanation = String(values.explanation || "").trim();
    if (explanation.length > VALIDATION_RULES.explanation.max) {
        errors.explanation = `Explanation must not exceed ${VALIDATION_RULES.explanation.max} characters`;
    }

    // Return early if validation failed
    if (Object.keys(errors).length > 0) {
        return { data: null, errors };
    }

    // Return fully typed and validated DTO
    const dto: CreateExerciseDTO = {
        question,
        correctAnswer,
        alternativeAnswers: alternativeAnswers.length > 0 ? alternativeAnswers : undefined,
        tags: tags.length > 0 ? tags : undefined,
        explanation: explanation.length > 0 ? explanation : undefined,
        collectionId,
    };

    return { data: dto, errors: {} };
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
	create: async ({ request, fetch, params}) => {
        if (!params.slug) {
            return fail(400, { errorText: "Missing collection ID" , fieldErrors: {} as Record<string, string>});
        }
        const formData = await request.formData();
        const { data: exerciseData, errors } = parseExerciseForm(formData, params.slug);


         // Return validation errors
        if (!exerciseData) {
            return fail(400, {
                errorText: "Validation failed",
                fieldErrors: errors,
            });
        }

        try {
            const backend = new Backend(fetch);
            await backend.api.exercises.create(exerciseData);
            // console.log('Exercise created:', result);
            throw redirect(303, `/collections/view/${params.slug}?exerciseCreated=1`);
        } catch (error) {
            const result = Backend.handleActionError(error);

            return fail(result.status, { errorText: result?.data.message, fieldErrors: {} as Record<string, string> });
        }
    },
} satisfies Actions;