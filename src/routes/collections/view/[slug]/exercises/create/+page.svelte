<script lang="ts">
	import { goto } from "$app/navigation";
	import ExerciseForm from "$lib/components/exercises/ExerciseEditForm.svelte";
	import { toastError } from "$lib/toast";
	import type { PageProps } from "./$types";
	// import { enhance } from "$app/forms";

	const props: PageProps = $props();

	const collectionId = $derived(props.data.collectionId);
	const formErrors = $derived(props.form?.errors || {});
	const generalFormError = $derived(props.form?.errorText || "");

	// Show toast on error
	$effect(() => {
		if (props.form?.errorText) {
			toastError(props.form.errorText);
		}
	});

	function handleCancel() {
		goto(`/collections/view/${collectionId}`);
	}
</script>

<ExerciseForm
	formTitle="Create New Exercise"
	submitButtonText="Create Exercise"
	mode="create"
	formErrors={formErrors}
	generalError={generalFormError}
	formAction="?/create"
	onCancel={handleCancel}
/>