<script lang="ts">
	import type { PageProps } from "./$types";
	import { page } from "$app/state";
	import Unauthorized from "$lib/components/pages/Unauthorized.svelte";
	
	const { data, params }: PageProps = $props();
	
</script>

{#if  data.user}
	<h1>Profile</h1>
	<!-- <pre>{JSON.stringify($session, null, 2)}</pre> -->
	<pre>{JSON.stringify(data?.user, null, 4)}</pre>
	<pre>{JSON.stringify(page, null, 2)}</pre>
	<pre>{JSON.stringify(data, null, 2)}</pre>
	<pre>{JSON.stringify(params, null, 2)}</pre>
{:else}
	<Unauthorized />
{/if}
