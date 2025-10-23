<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	// import { setUser, clearUser, isLoggedIn } from "$lib/stores/auth";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	let actions = $state<"in" | "up">("in");
	let name = $state("");
	let email = $state("");
	let password = $state("");
	let isLoading = $state(false);
	
</script>

<form method="POST" use:enhance={({ action }) => {
	isLoading = true;
	
	return async ({ result }) => {
		try {
			if (result.type === "success") {
				// Sign-in feedback
				if (action.search.includes("sign-in")) {
					toast.push("Signed in successfully!");
				}
				// Sign-up feedback
				else if (action.search.includes("sign-up")) {
					toast.push("Account created. You are signed in.");
				}
				// Sign-out feedback
				else if (action.search.includes("sign-out")) {
					toast.push("Logged out successfully");
				}
				
				// Invalidate and redirect together to reduce blink
				await invalidateAll();
				// await goto("/");
			} else if (result.type === "failure" && result.data) {
				// Show error message from server
				toast.push(result.data.message || "An error occurred");
				isLoading = false;
			}
		} catch (error) {
			console.error("Auth error:", error);
			toast.push("An unexpected error occurred");
			// isLoading = false;
		} finally {
			isLoading = false;
		}
	};
}}>
	{#if !props.data.user}
		<fieldset>
			<legend>Choose action:</legend>
			<label>
				<input type="radio" name="action" bind:group={actions} value="in" />
				Sign in
			</label>
			<label>
				<input type="radio" name="action" bind:group={actions} value="up" />
				Sign up
			</label>
		</fieldset>

		{#if actions === "up"}
			<input bind:value={name} placeholder="Name" name="name" />
		{/if}
		<input bind:value={email} placeholder="Email" name="email" />
		<input type="password" bind:value={password} placeholder="Password" name="password" />

		{#if actions === "in"}
			<button formaction="?/sign-in" type="submit" disabled={isLoading}>
				{isLoading ? "Signing in..." : "Sign In"}
			</button>
		{:else}
			<button formaction="?/sign-up" disabled={isLoading}>
				{isLoading ? "Signing up..." : "Sign Up"}
			</button>
		{/if}
	{:else}
		<div>
			Hi, {props.data.user.name ?? "Unnamed user"} ({props.data.user.email})!
			<button formaction="?/sign-out" type="submit" disabled={isLoading}>
				{isLoading ? "Logging out..." : "Sign Out"}
			</button>
		</div>
	{/if}
</form>
