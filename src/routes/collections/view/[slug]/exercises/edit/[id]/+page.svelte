
<!-- ============================================ -->
<!-- EDIT PAGE -->
<!-- ============================================ -->
<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	// import { enhance } from "$app/forms";
	import ExerciseForm from "$lib/components/ExerciseForm.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	const exercise = $derived(props.data.exercise);
	const collectionId = $derived(exercise?.collectionId || "");
	const formErrors = $derived(props.form?.errors || {});
	const generalFormError = $derived(props.form?.errorText || "");

	// Show toast on error
	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, { classes: ["error-toast"] });
		}
	});

	async function handleCancel() {
		if (collectionId) {
			await goto(`/collections/view/${collectionId}`, { replaceState: true });
		}
	}
</script>

{#if exercise}
	<ExerciseForm
		mode="edit"
		{exercise}
		formErrors={formErrors}
		generalError={generalFormError}
		formAction="?/update"
		onCancel={handleCancel}
	/>
{:else}
	<div class="container">
		<div class="card-lg">
			<p>Loading exercise...</p>
		</div>
	</div>
{/if}