<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import CollectionsTable from "$lib/components/CollectionsTable.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();
	const serverData = $derived(props.data?.serverData);
	const collections = $derived(serverData.collections);
	const pagination = $derived(serverData.pagination);
	
	let hasNextPage = $derived(Boolean(pagination?.hasNextPage));
	let hasPreviousPage = $derived(Boolean(pagination?.hasPreviousPage));
	
	let totalPages = $derived(pagination?.totalPages ?? 0);
	let totalItems = $derived(pagination?.totalItems ?? 0);
	
	const searchParams = $derived(page.url.searchParams);
	let currentPage = $derived(parseInt(searchParams.get("page") ?? pagination?.page?.toString() ?? "1", 10));
	let limit = $derived((searchParams.get("limit") ?? pagination?.limit?.toString() ?? "5"));

	async function goToPage(newPage: number) {
		const params = new URLSearchParams(page.url.search);
		params.set("page", Math.max(1, newPage).toString());
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		// No invalidateAll needed; navigation re-runs [+page.server.ts]
	}

	async function goToNextPage() {
		await goToPage(currentPage + 1);
	}

	async function goToPreviousPage() {
		await goToPage(currentPage - 1);
	}

	async function handleLimitChange(e: Event) {
		const newLimit = parseInt((e.currentTarget as HTMLSelectElement).value, 10) || 10;
		const params = new URLSearchParams(page.url.search);
		params.set("limit", newLimit.toString());
		params.set("page", "1");
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	onMount(() => {
		const deleted = page.url.searchParams.get("deleted");
		if (deleted === "1") {
			toast.push("Collection deleted.");
			goto(page.url.pathname, { replaceState: true, noScroll: true });
		}
	});
</script>

{#if props.data.user}
	<Button text="All Collections" onclick={() => goto("/collections/all")} />
	<Button text="Create New Collection" onclick={() => goto("/collections/create")} />

	<br />
	<h2>Your Collections</h2>

	{#if pagination}
		<select style="width: 200px;" onchange={handleLimitChange} value={limit}>
			<option value="5">5 per page</option>
			<option value="10">10 per page</option>
			<option value="25">25 per page</option>
		</select>
		<div class="pagination">
			<Button text="Previous" onclick={goToPreviousPage} disabled={!hasPreviousPage} />
			<span class="page-info">
				Page {currentPage} of {totalPages} ({totalItems} items total)
			</span>
			<Button text="Next" onclick={goToNextPage} disabled={!hasNextPage} />
		</div>
	{/if}

	{#if !collections || collections?.length === 0}
		<p>You have no collections yet. Create one!</p>
	{:else}
		<CollectionsTable {collections} />
	{/if}
{:else}
	<Unauthorized />
{/if}
