<!-- ============================================ -->
<!-- CREATE PAGE -->
<!-- ============================================ -->
<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import ExerciseForm from "$lib/components/exercises/ExerciseForm.svelte";
	import type { PageProps } from "./$types";
	// import { enhance } from "$app/forms";

	const props: PageProps = $props();

	const collectionId = $derived(props.data.collectionId);
	const formErrors = $derived(props.form?.errors || {});
	const generalFormError = $derived(props.form?.errorText || "");

	// Show toast on error
	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, { classes: ["error-toast"] });
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