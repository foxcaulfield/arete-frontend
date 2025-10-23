<script lang="ts">
	import { toast } from "@zerodevx/svelte-toast";

	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	import Forbidden from "$lib/components/Forbidden.svelte";
	import NotFound from "$lib/components/NotFound.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";

	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	// const data = props.data.__data;
	// const flags = props.;

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

{#if props.data.flags?.unauthorized}
	<Unauthorized />
{:else if props.data.flags?.forbidden}
	<Forbidden />
{:else if props.data.flags?.notFound}
	<NotFound />
{:else}
	<button onclick={backToCollections}>Back to Collections</button>
	<h1>{props.data.serverData.collection?.name}</h1>
	<p>Description: {props.data.serverData.collection?.description}</p>
	<p>ID: {props.data.serverData.collection?.id}</p>
	<p>User: {props.data.serverData.collection?.user?.name || "Unnamed User"} ({props.data.serverData.collection?.user?.id || "Unknown ID"})</p>

	<p>Created at: {props.data.serverData.collection?.createdAt}</p>
	<p>Updated at: {props.data.serverData.collection?.updatedAt}</p>
	<button onclick={() => goto(`/collections/edit/${props.data.serverData.collection?.id}${page.url.search}`)}>Edit collection</button>
	<form method="post" action="?/delete" onsubmit={confirmDelete} style="display: inline;">
		<button type="submit" disabled={false} class="delete-button"> Delete collection </button>
	</form>

	<button onclick={() => goto(`/collections/view/${props.data.serverData.collection?.id}/exercises/create${page.url.search}`)}>Create new exercise</button>
	<button onclick={() => goto(`/collections/view/${props.data.serverData.collection?.id}/exercises/drill${page.url.search}`)} class="go-drill"> Go drill</button>

	<hr/>
	<!-- {#if props.data.serverData.exercises?.length > 0}
		<ul>
			{#each props.data.serverData.exercises as exercise}
				<li>
					<strong>{exercise.text}</strong> (ID: {exercise.id}) - Created at: {exercise.createdAt}
				</li>
			{/each}
		</ul>
	{:else}
		<p>No exercises in this collection.</p>
	{/if} -->
{/if}
<!-- 
<style>
	.delete-button {
		background-color: #d9534f;
		color: white;
		width: 300px;
		border: 1px solid transparent;
	}
	.delete-button:hover {
		background-color: #c9302c;
	}
	.go-drill {
		background-color: #5cb85c;
		color: white;
		width: 200px;
		border: 1px solid transparent;
	}
	.go-drill:hover {
		background-color: #4cae4c;
	}
</style> -->
