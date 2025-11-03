// export function processExerciseFormData(formData: FormData): FormData {
// 	const processed = new FormData();

// 	const arrayKeys = ["additionalCorrectAnswers", "distractors"] as const;
// 	type ArrayKey = (typeof arrayKeys)[number];

// 	const arrayFields: Record<ArrayKey, string[]> = {
// 		additionalCorrectAnswers: [],
// 		distractors: [],
// 	};

// 	const optionalNullableFields: string[] = ["explanation", "translation"] satisfies (keyof Exercise.ResponseDto)[];

// 	// Process all form entries
// 	for (const [key, value] of formData.entries()) {
// 		if (value instanceof File && value.size === 0) {
// 			continue;
// 		}

// 		if (arrayKeys.includes(key as ArrayKey)) {
// 			if (typeof value === "string" && value.trim().length > 0) {
// 				arrayFields[key as ArrayKey].push(value.trim());
// 			}
// 			continue;
// 		}

// 		if (typeof value === "string" && value.trim().length === 0) {
// 			if (optionalNullableFields.includes(key)) {
// 				processed.append(key, "");
// 			}
// 			continue;
// 		}

// 		processed.append(key, value);
// 	}

// 	// Append array fields with proper syntax
// 	for (const key of arrayKeys) {
// 		// If array is empty, send empty array marker
// 		if (arrayFields[key].length === 0) {
// 			processed.append(`${key}[]`, "");
// 		} else {
// 			arrayFields[key].forEach((value) => {
// 				processed.append(`${key}[]`, value);
// 			});
// 		}
// 	}

// 	return processed;
// }

/**
 * Validates required parameters
 */
export function validateParams(params: Record<string, string | undefined>, required: string[]): string | null {
	for (const param of required) {
		if (!params[param]) {
			return `Missing required parameter: ${param}`;
		}
	}
	return null;
}
