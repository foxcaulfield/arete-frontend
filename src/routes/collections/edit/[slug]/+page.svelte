<script lang="ts">
	import type { PageProps } from "./$types";
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	import Unauthorized from "$lib/components/pages/Unauthorized.svelte";
	import NotFound from "$lib/components/pages/NotFound.svelte";
	import CollectionForm from "$lib/components/collections/CollectionForm.svelte";

	let props: PageProps = $props();

	let flags = $derived(props.data?.flags || {});
	let serverData = $derived(props.data?.serverData || {});
	let collection = $derived(serverData?.collection || null);

	// Safely parse form data - handle both array and string errors
	const formData = $derived((props.form as any) || {});
	const fieldErrors = $derived((formData.fieldErrors as Record<string, string | string[]>) || {});
	const generalError = $derived(formData.errorText);

	// Use submitted values if available, otherwise use collection data
	const initialValues = $derived(
		formData.values || { name: collection?.name, description: collection?.description }
	);

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
	<CollectionForm
		mode="edit"
		formAction="?/update"
		initialValues={initialValues}
		formErrors={fieldErrors}
		generalError={generalError}
		onCancel={() => backToView(collection.id)}
	/>
{/if}
 