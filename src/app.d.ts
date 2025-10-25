// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	interface PaginatedResponse<T> {
		data: T[];
		pagination: {
			page: number;
			limit: number;
			totalItems: number;
			totalPages: number;
			hasNextPage: boolean;
			hasPreviousPage: boolean;
		};
	}

	interface CreateCollectionDTO {
		name: string;
		description?: string;
	}

	interface UpdateCollectionDTO {
		name?: string;
		description?: string;
	}

	interface ResponseCollectionDTO {
		id: string;
		name: string;
		description: string;
		user: {
			id: string;
			name?: string;
		};
		createdAt: Date;
		updatedAt: Date;
	}

	interface User {
		id: string;
		email: string | null;
		name: string | null;
	}

	interface ResponseExerciseDTO {
		id: string;
		question: string;
		explanation: string | null;
		collectionId: string;
		createdAt: Date;
		updatedAt: Date;
	}

	interface CreateExerciseDTO {
		collectionId: string;
		type: ExerciseType;
		question: string;
		correctAnswer: string;
		additionalCorrectAnswers?: string[];
		distractors?: string[];
		explanation?: string;
	}

	interface CustomApiErrorInterface {
		requestStatusCode: number;
		errorText: string;
		// messages?: string[];
	}

	interface AccessFlags {
		unauthorized?: boolean;
		forbidden?: boolean;
		notFound?: boolean;
		errorText?: string;
	}

	type ExerciseType = "FILL_IN_THE_BLANK" | "CHOICE_SINGLE";

	interface CurrentQuestion {
		/* ResponseDrillQuestionDto */
		id: string;
		question: string;
		audioUrl?: string | null;
		imageUrl?: string | null;
		// placeholderSequence: string;
		// tags?: string[];
	}

	interface DrillResult {
		isCorrect: boolean;
		correctAnswer: string;
		explanation?: string;
		nextExerciseId?: string;
	}

	interface UserAnswerSubmission {
		exerciseId: string;
		userAnswer: string;
	}

	namespace App {
		// interface Error {}
		interface Locals {
			user: User | null;
			backendUrl: string | null;
		}
		interface PageData {
			__flags?: import("$lib/server/error-utils").AccessFlags;
			__data?: unknown;
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
