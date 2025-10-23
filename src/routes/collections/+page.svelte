<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	// import { userStore } from "$lib/stores/auth";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";
	import { toast } from "@zerodevx/svelte-toast";
	import CollectionsTable from "./CollectionsTable.svelte";

	const props: PageProps = $props();

	let currentPage = $state(1);
	let limit = $state("5");
	


	// Keep local state in sync with the URL (and fallback to server pagination)
	$effect(() => {
		const params = page.url.searchParams;
		const pagination = props.data?.serverData?.pagination;
		currentPage = parseInt(params.get("page") ?? pagination?.page?.toString() ?? "1", 10);
		limit = params.get("limit") ?? pagination?.limit?.toString() ?? "10";
	});

	async function goToPage(newPage: number) {
		const params = new URLSearchParams(page.url.search);
		params.set("page", Math.max(1, newPage).toString());
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		// No invalidateAll needed; navigation re-runs [+page.server.ts]
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
	<!-- {#if $session?.data?.user.role === "ADMIN"} -->
	<button onclick={() => goto("/collections/all")}>All Collections</button>
	<!-- {/if} -->
	<button onclick={() => goto("/collections/create")}>Create New Collection</button>

	<br />
	<h2>Your Collections</h2>

	{#if props.data.serverData?.pagination}
		<select style="width: 200px;" onchange={handleLimitChange} value={limit}>
			<option value="5">5 per page</option>
			<option value="10">10 per page</option>
			<option value="25">25 per page</option>
		</select>
		<div class="pagination">
			<button onclick={() => goToPage(currentPage - 1)} disabled={!props.data.serverData.pagination.hasPreviousPage}
				>Previous</button
			>

			<span class="page-info">
				Page {currentPage} of {props.data.serverData.pagination.totalPages}
				({props.data.serverData.pagination.totalItems} items total)
			</span>

			<button onclick={() => goToPage(currentPage + 1)} disabled={!props.data.serverData.pagination.hasNextPage}
				>Next</button
			>
		</div>
	{/if}
	<CollectionsTable collections={props.data.serverData.collections || []} />
{:else}
	<Unauthorized />
{/if}

<style>
	.pagination {
		display: flex;
		gap: 1rem;
		align-items: center;
		margin-top: 2rem;
		justify-content: center;
		flex-wrap: wrap;
	}

	.page-info {
		font-size: 0.95rem;
		min-width: 250px;
		text-align: center;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
