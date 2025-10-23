<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import NotFound from "$lib/components/NotFound.svelte";

	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	function backToView(collectionId: string) {
		const queryString = page.url.search;
		goto(`/collections/view/${collectionId}${queryString || ""}`, { noScroll: true });
	}
</script>

{#if props.data.flags?.unauthorized}
	<Unauthorized />
{:else if !props.data.serverData?.collection}
	<NotFound />
{:else}
	<h1>Edit collection</h1>

	<form action="?/update" method="POST">
		<div>
			<label for="name">Name</label>
			<input
				type="text"
				id="name"
				name="name"
				required
				value={props.form?.values?.name ?? props.data.serverData?.collection.name}
			/>
			<!-- {#if props.data.form?.fieldErrors?.name}
				<p class="error">{props.data.form.fieldErrors.name}</p>
			{/if} -->
		</div>

		<div>
			<label for="description">Description</label>
			<textarea id="description" name="description" rows="4"
				>{props.form?.values?.description ?? props.data.serverData?.collection.description}</textarea
			>
		</div>

		{#if props.form?.message}
			<p class="error">{props.form.message}</p>
		{/if}

		{#if props.data.serverData?.collection !== null}
			<button type="button" onclick={() => backToView(props.data.serverData.collection!.id)}>Cancel</button>
		{/if}
		<button formaction="?/update">Save</button>
	</form>
{/if}

<style>
	.error {
		color: #b00020;
	}
	form > div {
		margin-bottom: 0.75rem;
	}
</style>
