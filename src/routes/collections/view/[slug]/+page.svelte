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

	let props: PageProps = $props();

	let serverData = $derived(props.data?.serverData || {});
	let paginatedExercises = $derived(serverData.paginatedExercises);
	let currentCollection = $derived(serverData.collection);
	let flags = $derived(props.data?.flags || {});
	let userName = $derived(currentCollection?.user?.name || "Unnamed User");
	let userId = $derived(currentCollection?.user?.id || "Unknown ID");
	let hasExercises = $derived(Boolean(paginatedExercises && paginatedExercises?.data?.length > 0));

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
				<div class="table-container">
					<ExercisesTable exercises={paginatedExercises.data} />
				</div>
			{:else}
				<div class="empty-state">
					<p>No exercises found in this collection.</p>
				</div>
			{/if}
		</div>
		<div class="delete-row">
		</div>
	</div>
{/if}
