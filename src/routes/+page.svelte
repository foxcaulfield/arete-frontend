<script lang="ts">
	import Unauthorized from "$lib/components/Unauthorized.svelte";

	import type { PageProps } from "./$types";
	const { data }: PageProps = $props();
</script>

{#if data.user}
	<p>Welcome, {data.user.name}!</p>
{:else}
	<Unauthorized />
{/if}
