<script lang="ts">
	import { goto } from "$app/navigation";
	// import { page } from "$app/state";
	import { toast } from "@zerodevx/svelte-toast";
	import type { PageProps } from "./$types";
	import Button from "$lib/components/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import FormGroupTextarea from "$lib/components/FormGroupTextarea.svelte";
	import FormGroupTextInput from "$lib/components/FormGroupTextInput.svelte";

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let formValues = $derived(props.form?.values);
	let additionalCorrectAnswers = $derived(formValues?.additionalCorrectAnswers || []);
	let distractors = $derived(formValues?.distractors || []);
	let fieldErrors = $derived(props.form?.errors);

	// let tagInput = $state("");

	// Handle server action response
	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, {});
		}

		// if (props.form?.errors) {
		// 	fieldErrors = props.form.errors;
		// }
	});

	function goBack() {
		goto(`/collections/view/${collectionId}`);
	}

	function addDistractor() {
		distractors = [...distractors, ""];
	}

	function removeDistractor(index: number) {
		distractors.splice(index, 1);
		distractors = [...distractors];
	}

	function addAdditionalAnswer() {
		additionalCorrectAnswers = [...additionalCorrectAnswers, ""];
	}

	function removeAdditionalAnswer(index: number) {
		additionalCorrectAnswers.splice(index, 1);
		additionalCorrectAnswers = [...additionalCorrectAnswers];
	}
</script>

<div class="create-exercise">
	<h1>Create New Exercise</h1>

	<form action="?/create" method="POST" enctype="multipart/form-data">
		<div class="form-group">
			<label for="exercise-type"> Choose type </label>
			<select value={props.form?.values?.type || "FILL_IN_THE_BLANK"} name="exercise-type" id="exercise-type">
				{#each ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"] as ExerciseType[] as type}
					<option value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>
				{/each}
			</select>
		</div>

		<FormGroupTextarea
			idName="question"
			label="Question *"
			placeholder="Enter the question"
			value={props.form?.values?.question || ""}
			minMax={[5, 500]}
			errorText={fieldErrors?.question}
		/>

		<FormGroupTextInput
			idName="correctAnswer"
			label="Correct answer *"
			placeholder="Enter the correct answer"
			value={props.form?.values?.correctAnswer || ""}
			minMax={[1, 50]}
			errorText={fieldErrors?.correctAnswer}
		/>

		<div class="form-group">
			<label for="">Additional Correct Answers (optional)</label>
			<Button text="Add Another Answer" onclick={addAdditionalAnswer} />
			{#each additionalCorrectAnswers as answer, idx (idx)}
				<div class="alt-answer-row">
					<TextInput name="additionalCorrectAnswers" value={answer} placeholder="Additional correct answer" />
					<Button text="Remove" onclick={() => removeAdditionalAnswer(idx)} />
				</div>
			{/each}
			{#if fieldErrors?.additionalCorrectAnswers}
				<span class="field-error">{fieldErrors.additionalCorrectAnswers}</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="">Distractors (optional)</label>
			<Button text="Add Distractor" onclick={addDistractor} />
			{#each distractors as distractor, idx (idx)}
				<div class="alt-answer-row">
					<TextInput name="distractors" value={distractor} placeholder="Distractor answer" />
					<Button text="Remove" onclick={() => removeDistractor(idx)} />
				</div>
			{/each}
			{#if fieldErrors?.distractors}
				<span class="field-error">{fieldErrors.distractors}</span>
			{/if}
		</div>

		<FormGroupTextarea
			idName="explanation"
			label="Explanation (optional)"
			placeholder="Explain the answer"
			value={props.form?.values?.explanation || ""}
			minMax={[0, 1000]}
			errorText={fieldErrors?.explanation}
			required={false}
		/>

		<input type="file" name="image" accept="image/*" />
		<input type="file" name="audio" accept="audio/*" />

		<div class="form-actions">
			<Button text="Create Exercise" type="submit" />
			<Button text="Cancel" type="button" onclick={goBack} />
		</div>
	</form>
</div>
 