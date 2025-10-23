<script lang="ts">
	import { goto } from "$app/navigation";
	import Forbidden from "$lib/components/Forbidden.svelte";
	import CollectionsTable from "$lib/components/CollectionsTable.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();
	const { serverData, flags } = props.data;
</script>

{#if flags?.forbidden}
	<Forbidden />
{:else}
	<button onclick={() => goto("/collections")}>Back to Your Collections</button>
	<h1>All collections</h1>
	<CollectionsTable collections={serverData?.paginatedResponse.data || []} />
{/if}
