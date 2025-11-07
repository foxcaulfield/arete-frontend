<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/common/Button.svelte";
	import CollectionsTable from "$lib/components/collections/CollectionsTable.svelte";
	import Unauthorized from "$lib/components/pages/Unauthorized.svelte";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	// import { ArrowLeftIcon, ArrowRightIcon } from "@lucide/svelte";
	import { Pagination } from "@skeletonlabs/skeleton-svelte";
	import { toastSuccess } from "$lib/toast";

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
	let limit = $derived(searchParams.get("limit") ?? pagination?.limit?.toString() ?? "20");

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
			toastSuccess("Collection deleted.");
			goto(page.url.pathname, { replaceState: true, noScroll: true });
		}
	});
</script>

{#if props.data.user}
	<div class="space-y-4 p-4">
		<!-- Header Section -->
		<div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
			<div>
				<h1 class="h3 mb-1">Your Collections</h1>
				<p class="text-xs opacity-60">{totalItems} collection{totalItems !== 1 ? "s" : ""} total</p>
			</div>
			<div class="flex gap-2">
				<Button text="All Collections" onclick={() => goto("/collections/all")} preset="outlined" size="sm" />
				<Button text="Create New" onclick={() => goto("/collections/create")} size="sm" />
			</div>
		</div>

		<!-- Collections Card -->
		<div class="card preset-filled-surface-100-900 p-4 space-y-3">
			<!-- Controls Bar -->
			<div class="flex flex-col gap-3 pb-3 border-b border-opacity-20">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
					<div class="flex items-center gap-2">
						<label for="page-limit" class="text-xs font-medium opacity-60">Show</label>
						<select
							id="page-limit"
							class="select w-fit text-xs"
							value={String(limit)}
							onchange={handleLimitChange}
						>
							<option value="5">5</option>
							<option value="10">10</option>
							<option value="20">20</option>
						</select>
						<span class="text-xs opacity-60">per page</span>
					</div>
					{#if totalPages > 1}
						<div class="flex items-center justify-center gap-1 flex-wrap">
							<Pagination
								count={totalItems}
								pageSize={Number(limit)}
								page={currentPage}
								onPageChange={(event) => goToPage(event.page)}
							>
								<Pagination.Context>
									{#snippet children(pagination)}
										{#each pagination().pages as page, index (page)}
											{#if page.type === "page"}
												<Pagination.Item {...page}>
													{page.value}
												</Pagination.Item>
											{:else}
												<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
											{/if}
										{/each}
									{/snippet}
								</Pagination.Context>
							</Pagination>
						</div>
					{/if}
					<div class="flex flex-col sm:flex-row sm:items-center gap-2">
						<div class="flex items-center gap-2">
							<Button
								text="Previous"
								onclick={() => goToPage(currentPage - 1)}
								disabled={!hasPreviousPage}
								size="sm"
							/>
							<span class="text-xs opacity-60">
								{#if totalItems > 0}
									{(currentPage - 1) * Number(limit) + 1}–{Math.min(
										currentPage * Number(limit),
										totalItems
									)} of {totalItems}
								{:else}
									No items
								{/if}
							</span>
							<Button
								text="Next"
								onclick={() => goToPage(currentPage + 1)}
								disabled={!hasNextPage}
								size="sm"
							/>
						</div>

						<!-- <div class="text-xs opacity-60 sm:ml-2">
							Page <span class="font-medium">{currentPage}</span> of <span class="font-medium">{totalPages || 1}</span>
						</div> -->
					</div>
				</div>
			</div>

			<!-- Table Section -->
			{#if !collections || collections?.length === 0}
				<div class="text-center py-12 opacity-50">
					<p class="text-sm mb-2">No collections yet</p>
					<p class="text-xs opacity-75">Create one to get started!</p>
				</div>
			{:else}
				<div class="overflow-x-auto">
					<CollectionsTable {collections} />
				</div>
			{/if}
		</div>
	</div>
{:else}
	<Unauthorized />
{/if}
