// Get backend URL from runtime environment - NOT from import.meta.env (build-time only)
// Note: BACKEND_BASE_URL is validated in hooks.server.ts at app startup
import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { ApiError, ValidationError } from "./errors";

export class Backend {
	public static readonly backendBaseUrl = env.BACKEND_BASE_URL;

	private readonly fetch: typeof fetch;
	private readonly headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	public constructor(fetch: typeof globalThis.fetch) {
		this.fetch = fetch;
	}

	private async request(
		method: "GET" | "POST" | "PATCH" | "DELETE",
		endpoint: string,
		body?: unknown
	): Promise<Response> {
		const BACKEND_URL = Backend.backendBaseUrl;
		if (!BACKEND_URL) {
			return new Response("Backend URL is not configured", { status: 500 });
		}

		const safeBaseUrl = Backend.backendBaseUrl.replace(/\/$/, "");
		const safeEndpoint = endpoint.replace(/^\//, "");

		const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
		const headers = { ...this.headers };
		if (isFormData) {
			delete headers["Content-Type"];
		}

		const res = await this.fetch(`${safeBaseUrl}/${safeEndpoint}`, {
			method,
			credentials: "include",
			headers,
			body: isFormData ? body : body ? JSON.stringify(body) : undefined,
		});

		if (!res.ok) {
			await this.handleErrorResponse(res);
		}

		return res;
	}

	private async handleErrorResponse(res: Response): Promise<never> {
		let errorData: {
			statusCode?: number;
			error?: string;
			message?: string;
			fields?: Record<string, string[]>;
		};

		try {
			errorData = await res.json();
		} catch {
			// If response is not JSON, throw generic error
			throw new ApiError(res.status, res.statusText, `Request failed with status ${res.status}`);
		}

		// Handle validation errors (400 with fields)
		if (res.status === 400 && errorData.fields) {
			throw new ValidationError(errorData.fields, errorData.message);
		}

		// Handle other API errors
		throw new ApiError(
			errorData.statusCode || res.status,
			errorData.error || res.statusText,
			errorData.message || `Request failed with status ${res.status}`,
			errorData.fields
		);
	}

	public api = {
		auth: {
			me: async (): Promise<User> => {
				const response = await this.request("GET", "/me");
				const data = await response.json();
				return data as User;
			},
			signup: async (data: { name?: string; email?: string; password?: string }): Promise<Response> => {
				const response = await this.request("POST", "/api/auth/sign-up/email", data);
				return response;
			},
			signin: async (data: { email?: string; password?: string }): Promise<Response> => {
				const response = await this.request("POST", "/api/auth/sign-in/email", data);
				return response;
			},
			signout: async (): Promise<Response> => {
				const response = await this.request("POST", "/api/auth/sign-out", {});
				return response;
			},
		},
		collections: {
			list: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Collection.ResponseDto>> => {
				const response = await this.request("GET", `/collections/list?page=${page}&limit=${limit}`);
				return response.json();
			},
			all: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Collection.ResponseDto>> => {
				const response = await this.request("GET", `/collections/all?page=${page}&limit=${limit}`);
				return response.json();
			},
			create: async (name: string, description?: string): Promise<Collection.ResponseDto> => {
				const response = await this.request("POST", "/collections/create", { name, description });
				return response.json();
			},
			getById: async (id: string): Promise<Collection.ResponseDto> => {
				const response = await this.request("GET", `/collections/get_by_id/${id}`);
				return response.json();
			},
			update: async (id: string, data: Collection.UpdateDto): Promise<Collection.ResponseDto> => {
				const response = await this.request("PATCH", `/collections/update/${id}`, data);
				return response.json();
			},
			delete: async (id: string): Promise<{ success: boolean }> => {
				const response = await this.request("DELETE", `/collections/delete/${id}`);
				return response.json();
			},
		},
		exercises: {
			getById: async (id: string): Promise<Exercise.ResponseDto> => {
				const response = await this.request("GET", `/exercises/get_by_id/${id}`);
				return response.json();
			},

			create: async (payload: Exercise.CreateDto | FormData): Promise<Exercise.ResponseDto> => {
				const response = await this.request("POST", `/exercises/create`, payload);
				return response.json();
			},
			getDrillQuestion: async (collectionId: string): Promise<Quiz.QuestionDto> => {
				const response = await this.request("GET", `/exercises/drill/${collectionId}`);
				return response.json();
			},
			submitDrillAnswer: async (
				collectionId: string,
				exerciseId: string,
				userAnswer: string
			): Promise<Quiz.UserAnswerFeedbackDto> => {
				const response = await this.request("POST", `/exercises/drill/${collectionId}/submit`, {
					exerciseId,
					userAnswer,
				});
				return response.json();
			},
			getListByCollectionId: async (collectionId: string): Promise<PaginatedResponse<Exercise.ResponseDto>> => {
				const response = await this.request("GET", `/exercises/by_collection/${collectionId}`);
				return response.json();
			},
			getFile: async (fileType: string, filename: string): Promise<Response> => {
				const safeType = encodeURIComponent(fileType);
				const safeName = encodeURIComponent(filename);
				const response = await this.request("GET", `/exercises/files/${safeType}/${safeName}`);
				return response;
			},
		},
	};

	public static extractApiErrorFlags(e: unknown): AccessFlags {
		if (e instanceof ApiError) {
			if (e.statusCode === 401) return { unauthorized: true, errorText: e.message } as const;
			if (e.statusCode === 403) return { forbidden: true, errorText: e.message } as const;
			if (e.statusCode === 404) return { notFound: true, errorText: e.message } as const;
		}
		throw e; // unexpected -> bubble to +error.svelte
	}
	public static handleActionError<TVals extends Record<string, string | undefined>>(
		e: unknown,
		opts?: { redirectToOn401?: string; values?: TVals }
	) {
		if (e instanceof ApiError) {
			if (e.statusCode === 401 && opts?.redirectToOn401) {
				// throw redirect(303, opts.redirectToOn401);
				return fail(401, { message: "You need to be logged in to perform this action.", values: opts?.values });
			}
			if (e.statusCode === 403) {
				return fail(403, {
					message: "You don't have permission to perform this action.",
					values: opts?.values,
				});
			}
			// preserve user's input on any error
			return fail(e.statusCode, { message: e.error || "Request failed", values: opts?.values });
		}
		throw e;
	}
}
