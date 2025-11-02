// ============================================
// SHARED UTILITIES
// ============================================
// import type { RequestEvent } from "@sveltejs/kit";

/**
 * Processes FormData for exercise creation/update
 * - Handles NULL marker for explicit null values
 * - Converts empty strings to NULL for optional fields
 * - Removes empty files
 * - Converts array fields to proper format (field[] syntax)
 */
export function processExerciseFormData(formData: FormData): FormData {
	const processed = new FormData();

	// Array fields that need special handling
	const arrayKeys = ["additionalCorrectAnswers", "distractors"] as const;
	type ArrayKey = (typeof arrayKeys)[number];

	const arrayFields: Record<ArrayKey, string[]> = {
		additionalCorrectAnswers: [],
		distractors: [],
	};

	// Optional fields that should be set to null when empty (not skipped)
	const optionalNullableFields: string[] = ["explanation", "translation"]  satisfies (keyof Exercise.ResponseDto)[];

	// Process all form entries
	for (const [key, value] of formData.entries()) {
		// Handle explicit NULL marker
		if (typeof value === "string" && value === "NULL") {
			processed.append(key, "NULL");
			continue;
		}

		// Skip empty files
		if (value instanceof File && value.size === 0) {
			continue;
		}

		// Collect array fields
		if (arrayKeys.includes(key as ArrayKey)) {
			if (typeof value === "string" && value.trim().length > 0) {
				arrayFields[key as ArrayKey].push(value.trim());
			}
			continue;
		}

		// Handle empty strings for nullable fields - convert to NULL
		if (typeof value === "string" && value.trim().length === 0) {
			if (optionalNullableFields.includes(key)) {
				processed.append(key, "NULL");
			}
			// Skip empty strings for other fields (they're required or don't need null)
			continue;
		}

		// Add regular fields
		processed.append(key, value);
	}

	// Append array fields with proper syntax
	for (const key of arrayKeys) {
		arrayFields[key].forEach((value) => {
			processed.append(`${key}[]`, value);
		});
	}

	return processed;
}

/**
 * Validates required parameters
 */
export function validateParams(
	params: Record<string, string | undefined>,
	required: string[]
): string | null {
	for (const param of required) {
		if (!params[param]) {
			return `Missing required parameter: ${param}`;
		}
	}
	return null;
}
