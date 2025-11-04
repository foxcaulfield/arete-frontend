
<!-- ============================================ -->
<!-- EDIT PAGE -->
<!-- ============================================ -->
<script lang="ts">
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import { enhance } from "$app/forms";
	import ExerciseForm from "$lib/components/exercises/ExerciseEditForm.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	const exercise = $derived(props.data.exercise);
	const collectionId = $derived(exercise?.collectionId || "");
	const formErrors = $derived(props.form?.errors || {});
	const generalFormError = $derived(props.form?.errorText || "");

	let deleteFormElement: HTMLFormElement;
	let isDeleting = $state(false);

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

	function handleDelete() {
		if (!exercise) return;
		const confirmed = confirm(`Are you sure you want to delete this exercise?`);
		if (!confirmed) return;

		// Submit the delete form
		deleteFormElement?.requestSubmit();
	}

</script>

<!-- Hidden delete form -->
<form
	bind:this={deleteFormElement}
	method="POST"
	action="?/delete"
	use:enhance={() => {
		isDeleting = true;
		return async ({ result, update }) => {
			isDeleting = false;
			if (result.type === 'redirect') {
				// Let SvelteKit handle the redirect
				await update();
			} else if (result.type === 'failure') {
				// Show error toast
				toast.push(result.data?.errorText || 'Failed to delete exercise', { classes: ['error-toast'] });
				await update();
			}
		};
	}}
	style="display: none;"
>
</form>

{#if exercise}
	<ExerciseForm
		formTitle="Edit Exercise"
		submitButtonText="Update Exercise"
		mode="edit"
		{exercise}
		formErrors={formErrors}
		generalError={generalFormError}
		formAction="?/update"
		onCancel={handleCancel}
		handleDelete={handleDelete}
	/>
{:else}
	<div class="container">
		<div class="card-lg">
			<p>Loading exercise...</p>
		</div>
	</div>
{/if}