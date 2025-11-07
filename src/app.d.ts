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

	/* Collection Interfaces */
	namespace Collection {
		interface CreateDto {
			name: string;
			description?: string;
		}

		interface UpdateDto {
			name?: string;
			description?: string;
		}

		interface ResponseDto {
			id: string;
			name: string;
			description: string;
			user: {
				id: string;
				name?: string;
			};
			createdAt: Date;
			updatedAt: Date;
			attemptCount: number;
			exerciseCount: number;
		}
	}

	/* Exercise Interfaces */
	namespace Exercise {
		type ExerciseType = "FILL_IN_THE_BLANK" | "CHOICE_SINGLE";

		interface ResponseDto {
			id: string;
			question: string;
			audioUrl: string | null;
			imageUrl: string | null;
			type: ExerciseType;
			translation: string | null;
			explanation: string | null;
			distractors: string[] | null;
			collectionId: string;
			createdAt: string;
			updatedAt: string;
			isActive: boolean;
			additionalCorrectAnswers: string[] | null;
			correctAnswer: string | null;
			totalAttempts: number;
			correctAttempts: number;
		}

		interface CreateDto {
			collectionId: string;
			type: ExerciseType;
			question: string;
			correctAnswer: string;
			additionalCorrectAnswers?: string[];
			distractors?: string[];
			explanation?: string;
		}

		type UpdateDto = Partial<CreateDto>;
	}

	/* Quiz Interfaces */
	namespace Quiz {
		interface QuestionDto {
			id: string;
			question: string;
			audioUrl?: string | null;
			imageUrl?: string | null;
			type: ExerciseType;
			translation?: string | null;
			explanation?: string | null;
			distractors?: string[] | null;
			// placeholderSequence: string;
			// tags?: string[];
		}

		interface UserAnswerFeedbackDto {
			isCorrect: boolean;
			correctAnswer: string;
			explanation?: string;
			nextExerciseId?: string;
		}

		interface UserAnswerDto {
			exerciseId: string;
			userAnswer: string;
		}
	}

	/* Custom API Error Interface */
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

	/* *** User Interface *** */
	interface User {
		id: string;
		email: string | null;
		name: string | null;
	}

	namespace StyleProps {
		type Color = "primary" | "secondary" | "tertiary" | "success" | "warning" | "error" | "surface";
		type Shade = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
		type Preset = "filled" | "tonal" | "outlined" | "ghost";
		type Size = "sm" | "base" | "lg";
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
