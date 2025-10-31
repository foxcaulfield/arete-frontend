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
	import Button from "$lib/components/Button.svelte";
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

	async function goToNextPage() {
		await goToPage(currentPage + 1);
	}

	async function goToPreviousPage() {
		await goToPage(currentPage - 1);
	}

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
	<div class="collection-page">
		<div class="actions-row">
			<Button text="Back to Collections" onclick={backToCollections} />
			<Button text="Edit collection" onclick={goToEditCollection} />
			<Button text="Create new exercise" onclick={goToCreateExercise} />
			<Button text="Go drill" onclick={goToDrill} />
			<Button withAction={true} action="?/delete" onsubmit={confirmDelete} text="Delete collection" />
		</div>
		<div class="info-card">
			<h1>{currentCollection?.name}</h1>
			<div class="info-sections">
				<div class="info-section">
					<h2>Details</h2>
					<p><strong>Description:</strong> {currentCollection?.description}</p>
					<p><strong>ID:</strong> {currentCollection?.id}</p>
				</div>
				<div class="info-section">
					<h2>Owner & Dates</h2>
					<p><strong>User:</strong> {userName} <span class="user-id">({userId})</span></p>
					<p><strong>Created:</strong> {currentCollection?.createdAt}</p>
					<p><strong>Updated:</strong> {currentCollection?.updatedAt}</p>
				</div>
			</div>
		</div>
		<div class="exercises-block">
			<h2>Exercises</h2>
			{#if paginatedExercises && hasExercises}
				<!-- Pagination controls -->
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

				<!-- Table -->
				<ExercisesTable exercises={paginatedExercises.data} />

				<!-- Bottom pagination (for multi-page) -->
				<!-- {#if props.data.serverData.paginatedExercises?.pagination.totalPages > 1}
					<Pagination ... showLimitSelector={false} />
				{/if} -->
			{/if}
		</div>
		<div class="delete-row"></div>
	</div>
{/if}
