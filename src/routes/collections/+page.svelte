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
	<div class="container">
		<div class="card-lg">
			<div class="actions-row" style="justify-content:space-between;align-items:center">
				<div class="flex">
					<Button text="All Collections" onclick={() => goto("/collections/all")} variant="secondary" />
					<Button text="Create New Collection" onclick={() => goto("/collections/create")} style="margin-left: .6rem" />
				</div>
				<div class="flex" style="gap:.75rem;align-items:center">
					<label for="limit" class="muted" style="margin-right:.4rem">Show</label>
					<select id="limit" class="" onchange={handleLimitChange} value={limit}>
						<option value="5">5 per page</option>
						<option value="10">10 per page</option>
						<option value="25">25 per page</option>
					</select>
				</div>
			</div>

			<h2 style="margin-top:1rem">Your Collections</h2>

			{#if pagination}
				<div class="pagination" style="margin-top:1rem;display:flex;align-items:center;gap:1rem;justify-content:flex-end">
					<Button text="Previous" onclick={goToPreviousPage} disabled={!hasPreviousPage} variant="secondary" />
					<span class="page-info muted">
						Page {currentPage} of {totalPages} ({totalItems} items total)
					</span>
					<Button text="Next" onclick={goToNextPage} disabled={!hasNextPage} variant="secondary" />
				</div>
			{/if}
		</div>

		<div style="margin-top:1.25rem">
			{#if !collections || collections?.length === 0}
				<div class="empty-state">You have no collections yet. Create one!</div>
			{:else}
				<CollectionsTable {collections} />
			{/if}
		</div>
	</div>
{:else}
	<Unauthorized />
{/if}
