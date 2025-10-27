<script lang="ts">
	import type { PageProps } from "./$types";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import NotFound from "$lib/components/NotFound.svelte";
	import Button from "$lib/components/Button.svelte";

	let props: PageProps = $props();

	// // derived-like accessors (keeps original logic shape)
	// let flags = $derived(props.data?.flags || {});
	// let serverData = $derived(props.data?.serverData || {});
	// let collection = $derived(serverData?.collection || null);
	// let form = $derived(props.form || null);

	// // helper to read submitted values if validation failed
	// let formValues = $derived(form?.values || {});

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
	<Unauthorized message="You are not authorized to edit this collection." />
{:else if collection === null}
	<NotFound />
{:else}
	<div class="container">
		<div class="card-lg">
			<h1>Edit Collection</h1>
			<p class="muted" style="margin-top:.5rem">Update details for this collection.</p>
		</div>

		<form action="?/update" method="POST" class="card form-card" style="margin-top:1rem">
			<div class="form-grid">
				<div class="form-group">
					<label for="name" class="label">Name</label>
					<input
						id="name"
						name="name"
						class="text-input"
						placeholder="Collection name"
						required
						value={formValues?.name ?? collection?.name}
					/>

					{#if (props.form as any)?.fieldErrors?.name}
						<span class="field-error">{(props.form as any).fieldErrors.name}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="description" class="label">Description</label>
					<textarea
						id="description"
						name="description"
						class="text-area"
						placeholder="Description (optional)"
						rows="4"
					>{formValues?.description ?? collection?.description}</textarea>

					{#if (props.form as any)?.fieldErrors?.description}
						<span class="field-error">{(props.form as any).fieldErrors.description}</span>
					{/if}
				</div>
			</div>

			{#if (props.form as any)?.message}
				<div style="margin-top:.6rem"><span class="field-error">{(props.form as any).message}</span></div>
			{/if}

			<div class="actions-row actions-right" style="margin-top:1rem">
				<Button text="Save" type="submit" />
				<Button text="Cancel" type="button" variant="secondary" onclick={() => backToView(collection.id)} />
			</div>
		</form>
	</div>
{/if}
 