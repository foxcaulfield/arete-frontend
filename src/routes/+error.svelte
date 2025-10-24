<script lang="ts">
	import { page } from "$app/state";
	const { error, status, url } = page;
</script>

<svelte:head>
	<title>Oops! Error</title>
</svelte:head>

<div >
	<h1>Oops!!! Something went wrong.</h1>
	<p >{error?.message || "An unexpected error occurred."}</p>
	<p>Status Code: <strong>{status}</strong></p>
	<p>URL: <a href={url.href} target="_blank">{url.href}</a></p>
</div>
