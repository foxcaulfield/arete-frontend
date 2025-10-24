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

	<form action="?/create" method="POST">
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
			placeholder="Explain the answer (0-1000 chars)"
			value={props.form?.values?.explanation || ""}
			minMax={[0, 1000]}
			errorText={fieldErrors?.explanation}
			required={false}
		/>

		<div class="form-actions">
			<Button text="Create Exercise" type="submit" />
			<Button text="Cancel" type="button" onclick={goBack} />
		</div>
	</form>
</div>

<style>
	.create-exercise {
		max-width: 600px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
	}

	h1 {
		margin-bottom: 2rem;
		text-align: center;
	}

	.exercise-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	label {
		font-weight: 600;
		color: var(--color-text-primary);
		font-size: 0.95rem;
	}

	.required {
		color: var(--color-accent-primary);
		font-weight: 700;
	}

	.optional {
		color: var(--color-text-tertiary);
		font-weight: 400;
		font-size: 0.85rem;
	}

	textarea {
		resize: vertical;
		min-height: 100px;
	}

	.field-error {
		color: var(--color-error-light);
		font-size: 0.875rem;
		font-weight: 500;
		margin-top: 0.25rem;
		display: block;
		animation: slideDown var(--transition-fast);
	}

	.alt-answer-row {
		display: flex;
		gap: 0.75rem;
		align-items: stretch;
	}

	.alt-answer-row input {
		flex: 1;
	}

	.btn-remove {
		padding: 0.75rem 1.25rem;
		background: rgba(239, 68, 68, 0.2);
		color: var(--color-error-light);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-weight: 600;
		transition: all var(--transition-fast);
	}

	.btn-remove:hover {
		background: rgba(239, 68, 68, 0.3);
		border-color: var(--color-error-light);
	}

	.tag-input-row {
		display: flex;
		gap: 0.75rem;
		align-items: stretch;
	}

	.tag-input-row input {
		flex: 1;
	}

	.btn-add {
		padding: 0.75rem 1.5rem;
		background: rgba(16, 185, 129, 0.2);
		color: var(--color-success-light);
		border: 1px solid var(--color-success);
		border-radius: var(--radius-md);
		cursor: pointer;
		font-weight: 600;
		transition: all var(--transition-fast);
		margin-top: 0.5rem;
	}

	.btn-add:hover {
		background: rgba(16, 185, 129, 0.3);
		border-color: var(--color-success-light);
	}

	.tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 1rem;
		animation: slideUp var(--transition-fast);
	}

	.tag {
		background: rgba(255, 107, 53, 0.1);
		color: var(--color-accent-primary);
		padding: 0.5rem 1rem;
		border-radius: 20px;
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		border: 1px solid rgba(255, 107, 53, 0.3);
		font-weight: 500;
	}

	.tag button {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1.2rem;
		padding: 0;
		color: inherit;
		transition: opacity var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
	}

	.tag button:hover {
		opacity: 0.7;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 1.5rem;
		padding-top: 1rem;
		border-top: 1px solid var(--color-border-primary);
	}

	button[type="submit"],
	.btn-cancel {
		padding: 1rem 2rem;
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-weight: 600;
		font-size: 1rem;
		transition: all var(--transition-fast);
		flex: 1;
	}

	button[type="submit"] {
		background: var(--gradient-primary);
		color: var(--color-accent-dark);
		box-shadow: var(--shadow-accent);
	}

	button[type="submit"]:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: var(--shadow-accent-hover);
	}

	button[type="submit"]:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none;
	}

	.btn-cancel {
		background: rgba(51, 65, 85, 0.8);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border-secondary);
	}

	.btn-cancel:hover {
		background: rgba(71, 85, 105, 0.9);
		border-color: var(--color-border-hover);
		transform: translateY(-2px);
	}

	@media (max-width: 640px) {
		.create-exercise {
			padding: 1rem;
		}

		h1 {
			font-size: 1.5rem;
		}

		.form-actions {
			flex-direction: column;
		}

		button[type="submit"],
		.btn-cancel {
			width: 100%;
		}

		.alt-answer-row {
			flex-direction: column;
		}

		.tag-input-row {
			flex-direction: column;
		}
	}
</style>
