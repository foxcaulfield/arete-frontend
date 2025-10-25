// Get backend URL from runtime environment - NOT from import.meta.env (build-time only)
// Use process.env which reads from container environment variables at runtime
// Note: BACKEND_BASE_URL is validated in hooks.server.ts at app startup
import { fail } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

class Response500 extends Response {
	constructor(message: string) {
		super(JSON.stringify({ error: message }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
}

export class CustomApiError extends Error implements CustomApiErrorInterface {
	constructor(
		public requestStatusCode: number,
		public errorText: string
		// public messages?: string[]
	) {
		super(errorText || `Request failed with status ${requestStatusCode}`);
	}
}

const isStr = (val: unknown): val is string => typeof val === "string";
const convertToString = (val: unknown): string => (isStr(val) ? val : JSON.stringify(val));

export class Backend {
	public static readonly backendBaseUrl = env.BACKEND_BASE_URL;

	private readonly fetch: typeof fetch;
	private readonly headers: Record<string, string> = {
		"Content-Type": "application/json",
	};

	public constructor(fetch: typeof globalThis.fetch) {
		this.fetch = fetch;
		// this.baseUrl = baseUrl;
	}

	private async request(
		method: "GET" | "POST" | "PATCH" | "DELETE",
		endpoint: string,
		body?: unknown
	): Promise<Response> {
		const BACKEND_URL = Backend.backendBaseUrl;
		if (!BACKEND_URL) {
			return new Response500("BACKEND_URL is not configured");
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
			// headers: this.headers,
			// body: body ? JSON.stringify(body) : undefined,
		});

		if (!res.ok) {
			const { requestStatusCode: status, errorText } = await this.extractBackendErrorData(res);

			throw new CustomApiError(status, errorText);
		}

		return res;
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
			list: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ResponseCollectionDTO>> => {
				const response = await this.request("GET", `/collections/list?page=${page}&limit=${limit}`);
				return response.json();
			},
			all: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<ResponseCollectionDTO>> => {
				const response = await this.request("GET", `/collections/all?page=${page}&limit=${limit}`);
				return response.json();
			},
			create: async (name: string, description?: string): Promise<ResponseCollectionDTO> => {
				const response = await this.request("POST", "/collections/create", { name, description });
				return response.json();
			},
			getById: async (id: string): Promise<ResponseCollectionDTO> => {
				const response = await this.request("GET", `/collections/get_by_id/${id}`);
				return response.json();
			},
			update: async (id: string, data: UpdateCollectionDTO): Promise<ResponseCollectionDTO> => {
				const response = await this.request("PATCH", `/collections/update/${id}`, data);
				return response.json();
			},
			delete: async (id: string): Promise<{ success: boolean }> => {
				const response = await this.request("DELETE", `/collections/delete/${id}`);
				return response.json();
			},
		},
		exercises: {
			create: async (payload: CreateExerciseDTO | FormData): Promise<ResponseExerciseDTO> => {
				const response = await this.request("POST", `/exercises/create`, payload);
				return response.json();
			},
			getDrillQuestion: async (collectionId: string): Promise<CurrentQuestion> => {
				const response = await this.request("GET", `/exercises/drill/${collectionId}`);
				return response.json();
			},
			submitDrillAnswer: async (
				collectionId: string,
				exerciseId: string,
				userAnswer: string
			): Promise<DrillResult> => {
				const response = await this.request("POST", `/exercises/drill/${collectionId}/submit`, {
					exerciseId,
					userAnswer,
				});
				return response.json();
			},
			getListByCollectionId: async (collectionId: string): Promise<PaginatedResponse<ResponseExerciseDTO>> => {
				const response = await this.request("GET", `/exercises/by_collection/${collectionId}`);
				return response.json();
			},
		},
	};

	private async extractBackendErrorData(res: Response): Promise<CustomApiErrorInterface> {
		let rawText: string = "";
		let parsed: Record<string, unknown> = {};

		try {
			// Try to parse JSON, otherwise get text, otherwise ignore
			const contentType = res.headers.get("Content-Type") ?? "";
			if (contentType.includes("application/json")) {
				parsed = await res.json();
			} else {
				rawText = await res.text();
			}

			const msgField: unknown = parsed?.message;
			const errField: unknown = parsed?.error;

			// Try to surface a human-friendly message (NestJS often returns { message: string | string[] })
			const messages = Array.isArray(msgField)
				? msgField
				: [
						(isStr(msgField) ? msgField : isStr(errField) ? errField : rawText) ||
							`Request failed with status ${res.status}`,
					];

			return {
				requestStatusCode: res.status,
				errorText:
					parsed || messages
						? `${parsed ? JSON.stringify(parsed) : rawText}: ${messages.map(convertToString).join("; ")}`
						: `Request failed with status ${res.status}`,
			};
		} catch (e: unknown | Error) {
			// Ignore parsing errors, return generic message
			return {
				requestStatusCode: res.status,
				errorText: res.text ? await res.text() : `Request failed with status ${res.status + JSON.stringify(e)}`,
			};
		}
	}

	public static extractApiErrorFlags(e: unknown): AccessFlags {
		if (e instanceof CustomApiError) {
			if (e.requestStatusCode === 401) return { unauthorized: true, errorText: e.message } as const;
			if (e.requestStatusCode === 403) return { forbidden: true, errorText: e.message } as const;
			if (e.requestStatusCode === 404) return { notFound: true, errorText: e.message } as const;
		}
		throw e; // unexpected -> bubble to +error.svelte
	}
	public static handleActionError<TVals extends Record<string, string | undefined>>(
		e: unknown,
		opts?: { redirectToOn401?: string; values?: TVals }
	) {
		if (e instanceof CustomApiError) {
			if (e.requestStatusCode === 401 && opts?.redirectToOn401) {
				// throw redirect(303, opts.redirectToOn401);
				return fail(401, { message: "You need to be logged in to perform this action.", values: opts?.values });
			}
			if (e.requestStatusCode === 403) {
				return fail(403, {
					message: "You don't have permission to perform this action.",
					values: opts?.values,
				});
			}
			// preserve user's input on any error
			return fail(e.requestStatusCode, { message: e.errorText || "Request failed", values: opts?.values });
		}
		throw e;
	}
}
