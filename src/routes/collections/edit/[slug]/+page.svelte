<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Button from "$lib/components/Button.svelte";
	import NotFound from "$lib/components/NotFound.svelte";

	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	let flags = $derived(props.data?.flags || {});
	let serverData = $derived(props.data?.serverData || {});
	let collection = $derived(serverData?.collection || null);
	let form = $derived(props.form || null);
	let formValues = $derived(form?.values || {});

	function backToView(collectionId: string) {
		const queryString = page.url.search;
		goto(`/collections/view/${collectionId}${queryString || ""}`, { noScroll: true });
	}
</script>

{#if flags?.unauthorized}
	<Unauthorized />
{:else if !collection}
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
				value={formValues?.name ?? collection?.name}
			/>
			<!-- {#if props.data.form?.fieldErrors?.name}
				<p class="error">{props.data.form.fieldErrors.name}</p>
			{/if} -->
		</div>

		<div>
			<label for="description">Description</label>
			<textarea id="description" name="description" rows="4"
				>{formValues?.description ?? collection?.description}</textarea
			>
		</div>

		{#if form?.message}
			<p class="error">{form.message}</p>
		{/if}

		{#if collection !== null}
			<Button text="Cancel" onclick={() => backToView(collection.id)} />
		{/if}
		<Button text="Save" type="submit" />
	</form>
{/if}
 