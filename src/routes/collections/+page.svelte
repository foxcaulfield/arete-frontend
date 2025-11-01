<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/common/Button.svelte";
	import CollectionsTable from "$lib/components/collections/CollectionsTable.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount } from "svelte";
	import type { PageProps } from "./$types";

	import { ArrowLeftIcon, ArrowRightIcon } from "@lucide/svelte";
	import { Pagination } from "@skeletonlabs/skeleton-svelte";

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
			toast.push("Collection deleted.");
			goto(page.url.pathname, { replaceState: true, noScroll: true });
		}
	});
</script>

{#if props.data.user}
	<div class="card w-full preset-filled-surface-100-900 p-4 text-center">
		<div>
			<div style="justify-content:space-between;align-items:center">
				<div class="flex">
					<Button text="All Collections" onclick={() => goto("/collections/all")} color="secondary" />
					<Button
						text="Create New Collection"
						onclick={() => goto("/collections/create")}
						style="margin-left: .6rem"
					/>
				</div>
			</div>

			<h2 style="margin-top:1rem">Your Collections</h2>
		</div>

		<div class="flex justify-between items-center gap-4 w-full">
			<label class="label">
				<span class="sr-only">Page Size</span>
				<select class="select w-fit" value={String(limit)} onchange={handleLimitChange}>
					<option value="5">5</option>
					<option value="10">10</option>
					<option value="20">20</option>
				</select>
			</label>
			<Pagination
				count={totalItems}
				pageSize={Number(limit)}
				page={currentPage}
				onPageChange={(event) => goToPage(event.page)}
			>
				<Pagination.PrevTrigger>
					<ArrowLeftIcon class="size-4" />
				</Pagination.PrevTrigger>
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
				<Pagination.NextTrigger>
					<ArrowRightIcon class="size-4" />
				</Pagination.NextTrigger>
			</Pagination>
		</div>

		{#if !collections || collections?.length === 0}
			<div class="empty-state">You have no collections yet. Create one!</div>
		{:else}
			<CollectionsTable {collections} />
		{/if}
	</div>
{:else}
	<Unauthorized />
{/if}
