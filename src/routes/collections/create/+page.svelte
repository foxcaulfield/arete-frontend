<script lang="ts">
	import type { PageProps } from "./$types";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import CollectionForm from "$lib/components/collections/CollectionForm.svelte";

	let props: PageProps = $props();
	let isUnauthorized = $derived(Boolean(props.data?.flags?.unauthorized));

	// Safely parse form data - handle both array and string errors
	const formData = $derived((props.form as any) || {});
	const fieldErrors = $derived((formData.fieldErrors as Record<string, string | string[]>) || {});
	const generalError = $derived(formData.errorText);

	function handleCancel() {
		history.back();
	}
</script>

{#if isUnauthorized}
	<Unauthorized message="You are not authorized to create a collection." />
{:else}
	<CollectionForm
		mode="create"
		formAction="?/create"
		initialValues={formData.values}
		formErrors={fieldErrors}
		generalError={generalError}
		onCancel={handleCancel}
	/>
{/if}
