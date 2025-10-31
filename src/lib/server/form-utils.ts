// ============================================
// SHARED UTILITIES
// ============================================
// import type { RequestEvent } from "@sveltejs/kit";

/**
 * Processes FormData for exercise creation/update
 * - Removes empty strings and empty files
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

	// Process all form entries
	for (const [key, value] of formData.entries()) {
		// Skip empty strings
		if (typeof value === "string" && value.trim().length === 0) {
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
