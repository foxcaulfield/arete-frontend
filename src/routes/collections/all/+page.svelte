<script lang="ts">
	import { goto } from "$app/navigation";
	import Forbidden from "$lib/components/pages/Forbidden.svelte";
	import CollectionsTable from "$lib/components/collections/CollectionsTable.svelte";
	import type { PageProps } from "./$types";
	import Button from "$lib/components/common/Button.svelte";

	const props: PageProps = $props();
	const { serverData, flags } = props.data;

	function gotoCollections() {
		goto("/collections");
	}
</script>

{#if flags?.forbidden}
	<Forbidden />
{:else}
	<Button text="Back to Your Collections" onclick={gotoCollections} />
	<h1>All collections</h1>
	<CollectionsTable collections={serverData?.paginatedResponse.data || []} />
{/if}
