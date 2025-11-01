<script lang="ts">
	import { toast } from "@zerodevx/svelte-toast";

	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	import Forbidden from "$lib/components/Forbidden.svelte";
	import NotFound from "$lib/components/NotFound.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";

	import type { PageProps } from "./$types";
	import ExercisesTable from "$lib/components/ExercisesTable.svelte";
	import Button from "$lib/components/common/Button.svelte";
	import Pagination from "$lib/components/Pagination.svelte";

	let props: PageProps = $props();

	let serverData = $derived(props.data?.serverData || {});
	let paginatedExercises = $derived(serverData.paginatedExercises);
	let pagination = $derived(paginatedExercises?.pagination);

	let currentCollection = $derived(serverData.collection);
	let flags = $derived(props.data?.flags || {});
	let userName = $derived(currentCollection?.user?.name || "Unnamed User");
	let userId = $derived(currentCollection?.user?.id || "Unknown ID");
	let hasExercises = $derived(Boolean(paginatedExercises && paginatedExercises?.data?.length > 0));

	let hasNextPage = $derived(Boolean(pagination?.hasNextPage));
	let hasPreviousPage = $derived(Boolean(pagination?.hasPreviousPage));

	let totalPages = $derived(pagination?.totalPages ?? 0);
	let totalItems = $derived(pagination?.totalItems ?? 0);

	const searchParams = $derived(page.url.searchParams);
	let currentPage = $derived(parseInt(searchParams.get("page") ?? pagination?.page?.toString() ?? "1", 10));
	let limit = $derived(searchParams.get("limit") ?? pagination?.limit?.toString() ?? "5");

	async function goToPage(newPage: number) {
		const params = new URLSearchParams(page.url.search);
		params.set("page", Math.max(1, newPage).toString());
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		// No invalidateAll needed; navigation re-runs [+page.server.ts]
	}

	// async function goToNextPage() {
	// 	await goToPage(currentPage + 1);
	// }

	// async function goToPreviousPage() {
	// 	await goToPage(currentPage - 1);
	// }

	// let isDeleting = $state(false);
	function confirmDelete(e: Event) {
		if (!confirm("Delete this collection? This cannot be undone.")) {
			e.preventDefault();
		}
	}

	function backToCollections() {
		const qs = page.url.search;
		goto(`/collections${qs || ""}`, { noScroll: true });
	}

	function goToEditCollection() {
		const qs = page.url.search;
		goto(`/collections/edit/${currentCollection?.id}${qs || ""}`, { noScroll: true });
	}

	function goToCreateExercise() {
		const qs = page.url.search;
		goto(`/collections/view/${currentCollection?.id}/exercises/create${qs || ""}`, {
			noScroll: true,
		});
	}

	function goToDrill() {
		const qs = page.url.search;
		goto(`/collections/view/${currentCollection?.id}/exercises/drill${qs || ""}`, {
			noScroll: true,
		});
	}

	// async function handleLimitChange(e: Event) {
	// 	const newLimit = parseInt((e.currentTarget as HTMLSelectElement).value, 10) || 10;
	// 	const params = new URLSearchParams(page.url.search);
	// 	params.set("limit", newLimit.toString());
	// 	params.set("page", "1");
	// 	await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	// }

	async function onLimitChange(limit: number) {
		const params = new URLSearchParams(page.url.search);
		params.set("limit", limit.toString());
		params.set("page", "1");
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	onMount(() => {
		const searchParams = new URLSearchParams(page.url.search);
		let changed = false;

		const isUpdated = searchParams.get("updated") === "1";
		const isCreated = searchParams.get("created") === "1";
		const isExerciseCreated = searchParams.get("exerciseCreated") === "1";

		if (isUpdated) {
			toast.push("Collection updated successfully!");
			searchParams.delete("updated");
			changed = true;
		}

		if (isCreated) {
			toast.push("Collection created successfully!");
			searchParams.delete("created");
			changed = true;
		}

		if (isExerciseCreated) {
			toast.push("Exercise created successfully!");
			searchParams.delete("exerciseCreated");
			changed = true;
		}

		if (changed) {
			const queryString = searchParams.toString();
			goto(`${page.url.pathname}${queryString ? `?${queryString}` : ""}`, { replaceState: true, noScroll: true });
		}
	});

	onMount(() => {
		const updated = page.url.searchParams.get("exerciseUpdated");
		if (updated === "1") {
			toast.push("Exercise updated successfully!");
			goto(page.url.pathname, { replaceState: true, noScroll: true });
		}
	});
</script>

{#if flags?.unauthorized}
	<Unauthorized />
{:else if flags?.forbidden}
	<Forbidden />
{:else if flags?.notFound}
	<NotFound />
{:else}
	<div class="space-y-4 p-4">
		<!-- Main Header - Minimal -->
		<div class="flex items-start justify-between">
			<div class="flex-1 min-w-0">
				<h1 class="h3 mb-0.5 truncate">{currentCollection?.name}</h1>
				<p class="text-xs opacity-60 line-clamp-2">{currentCollection?.description}</p>
			</div>
			<div class="flex gap-1 flex-shrink-0">
				<Button text="Back" onclick={backToCollections} preset="ghost" size="sm" />
				<Button text="Edit" onclick={goToEditCollection} color="secondary" size="sm" />
			</div>
		</div>

		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<!-- Left: Info Sidebar -->
			<div class="lg:col-span-1 space-y-3 text-xs">
				<div class="card preset-filled-surface-100-900 p-3 space-y-3">
					<!-- Owner Block -->
					<div>
						<span class="font-medium opacity-60 block mb-1">Owner</span>
						<div class="bg-black/10 rounded p-2">
							<p class="font-medium">{userName}</p>
							<code class="text-xs opacity-75 break-all block">{userId}</code>
						</div>
					</div>

					<!-- Dates Block -->
					<div>
						<span class="font-medium opacity-60 block mb-1">Timeline</span>
						<div class="space-y-1">
							<div class="bg-black/10 rounded p-2">
								<span class="text-xs opacity-75">Created</span>
								<time class="block font-mono text-xs">{currentCollection?.createdAt}</time>
							</div>
							<div class="bg-black/10 rounded p-2">
								<span class="text-xs opacity-75">Updated</span>
								<time class="block font-mono text-xs">{currentCollection?.updatedAt}</time>
							</div>
						</div>
					</div>

					<!-- ID Block -->
					<div>
						<span class="font-medium opacity-60 block mb-1">Collection ID</span>
						<code class="text-xs bg-black/10 p-2 rounded block break-all">{currentCollection?.id}</code>
					</div>
				</div>

				<!-- Quick Actions Card -->
				<div class="card preset-filled-surface-100-900 p-3 space-y-2">
					<span class="font-medium opacity-60 text-xs block">Actions</span>
					<Button text="Create Exercise" onclick={goToCreateExercise} fullWidth={true} size="sm" />
					<Button text="Start Drill" onclick={goToDrill} color="secondary" fullWidth={true} size="sm" />
					<Button
						withAction={true}
						action="?/delete"
						onsubmit={confirmDelete}
						text="Delete Collection"
						color="error"
						fullWidth={true}
						size="sm"
					/>
				</div>
			</div>

			<!-- Right: Exercises Main Content -->
			<div class="lg:col-span-2">
				<div class="card preset-filled-surface-100-900 p-4 space-y-3">
					<div class="flex items-center justify-between mb-2">
						<h2 class="text-base font-semibold">Exercises</h2>
						<span class="text-xs opacity-60 font-medium">{totalItems} total</span>
					</div>

					<!-- Pagination Controls -->
					<Pagination
						{currentPage}
						{totalPages}
						{totalItems}
						{hasNextPage}
						{hasPreviousPage}
						limit={parseInt(limit)}
						onPageChange={goToPage}
						{onLimitChange}
					/>

					<!-- Exercises Table or Empty State -->
					{#if paginatedExercises && hasExercises}
						<div class="overflow-x-auto">
							<ExercisesTable exercises={paginatedExercises.data} />
						</div>
					{:else}
						<div class="text-center py-12 opacity-40">
							<p class="text-sm mb-2">No exercises yet</p>
							<p class="text-xs opacity-75">Create one from the Actions panel to get started</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
