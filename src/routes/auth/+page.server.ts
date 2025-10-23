import { fail } from "@sveltejs/kit";
import type { Actions } from "./$types";
import { Backend } from "$lib/server/backend-manager";
import * as cookieParser from "cookie-es";

export const actions = {
	"sign-in": async ({ request, fetch, cookies }) => {
		const formData = await request.formData();
		const email = formData.get("email")?.toString() || "";
		const password = formData.get("password")?.toString() || "";
		try {
			const backend = new Backend(fetch);
			const response = await backend.api.auth.signin({ email, password });

			// Extract and parse Set-Cookie header from backend
			const incomingCookies = response.headers.getSetCookie();

			incomingCookies?.forEach((incomingCookie) => {
				const { name, value, httpOnly, sameSite, path, maxAge } = cookieParser.parseSetCookie(incomingCookie);
				cookies.set(name, value, {
					httpOnly,
					sameSite,
					path: path || "/",
					maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days
				});
			});

			const data = await response.json();

			if (!response.ok) {
				return fail(400, { message: data.error || "Sign in failed" });
			}

			// console.log("Sign-in successful, user:", data.user);
			return { success: true, user: data.user };
		} catch (error) {
			// console.error("Auth proxy error:", error);
			const message = error instanceof Error ? error.message : "Auth failed";
			return fail(400, { message });
		}
	},
	"sign-up": async ({ request, fetch, cookies }) => {
		const formData = await request.formData();
		const name = formData.get("name")?.toString() || "";
		const email = formData.get("email")?.toString() || "";
		const password = formData.get("password")?.toString() || "";
		try {
			const backend = new Backend(fetch);
			const response = await backend.api.auth.signup({ email, password, name });

			// Extract and parse Set-Cookie header from backend
			const incomingCookies = response.headers.getSetCookie();

			incomingCookies?.forEach((incomingCookie) => {
				const { name, value, httpOnly, sameSite, path, maxAge } = cookieParser.parseSetCookie(incomingCookie);
				cookies.set(name, value, {
					httpOnly,
					sameSite,
					path: path || "/",
					maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days
				});
			});

			const data = await response.json();

			if (!response.ok) {
				// toast.push(data.error || "Sign up failed");
				return fail(400, { message: data.error || "Sign up failed" });
			}

			return { success: true, user: data.user };
		} catch (error) {
			console.error("Auth proxy error:", error);
			const message = error instanceof Error ? error.message : "Auth failed";
			return fail(400, { message });
		}
	},
	"sign-out": async ({ fetch, cookies }) => {
		try {
			const backend = new Backend(fetch);
			const response = await backend.api.auth.signout();

			// Extract and parse Set-Cookie header from backend
			const incomingCookies = response.headers.getSetCookie();

			incomingCookies?.forEach((incomingCookie) => {
				const { name, value, httpOnly, sameSite, path, maxAge } = cookieParser.parseSetCookie(incomingCookie);
				cookies.set(name, value, {
					httpOnly,
					sameSite,
					path: path || "/",
					maxAge: maxAge || 60 * 60 * 24 * 7, // 7 days
				});
			});

			const data = await response.json();

			// Return the response
			// await invalidateAll();
			return { success: response.ok, data };
		} catch (error) {
			console.error("Auth proxy error:", error);
			const message = error instanceof Error ? error.message : "Auth failed";
			return fail(400, { message });
		}
	},
} satisfies Actions;
