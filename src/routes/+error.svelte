<script lang="ts">
	import { page } from "$app/state";
	const { error, status, url } = page;
</script>

<svelte:head>
	<title>Oops! Error</title>
</svelte:head>

<div class="error-container">
	<h1>Oops!!! Something went wrong.</h1>
	<p class="error-message">{error?.message || "An unexpected error occurred."}</p>
	<p class="error-status">Status Code: <strong>{status}</strong></p>
	<p class="error-url">URL: <a href={url.href} target="_blank">{url.href}</a></p>
</div>
