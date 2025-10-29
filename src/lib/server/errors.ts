// src/lib/api/errors.ts
export class ApiError extends Error {
	constructor(
		public statusCode: number,
		public error: string,
		message: string,
		public fields?: Record<string, string[]>
	) {
		super(message);
		this.name = "ApiError";
	}
}

export class ValidationError extends ApiError {
	constructor(
		public fields: Record<string, string[]>,
		message = "Validation failed"
	) {
		super(400, "Validation Error", message, fields);
		this.name = "ValidationError";
	}

	// Helper to get all errors as a flat array
	getAllErrors(): string[] {
		return Object.values(this.fields).flat();
	}

	// Helper to get first error for a field
	getFieldError(field: string): string | undefined {
		return this.fields[field]?.[0];
	}

	// Helper to check if field has errors
	hasFieldError(field: string): boolean {
		return !!this.fields[field]?.length;
	}
}
