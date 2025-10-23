<script lang="ts">
	import { goto } from "$app/navigation";
	// import { page } from "$app/state";
	import { toast } from "@zerodevx/svelte-toast";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();
	const collectionId = props.data.collectionId;

	let additionalCorrectAnswers = $state(props.form?.values?.additionalCorrectAnswers || []);
    let distractors = $state(props.form?.values?.distractors || []);

	let isSubmitting = $state(false);
	let fieldErrors = $state<Record<string, string> | null>(null);
	// let tagInput = $state("");

	// Handle server action response
	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, {});
		}

		if (props.form?.errors) {
			fieldErrors = props.form.errors;
		}
	});

	// function addTag() {
	// 	if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
	// 		formData.tags = [...formData.tags, tagInput.trim()];
	// 		tagInput = "";

	// 		// Clear any tag-related errors
	// 		if (fieldErrors?.tags) {
	// 			delete fieldErrors.tags;
	// 		}
	// 	}
	// }

	// function removeTag(tag: string) {
	// 	formData.tags = formData.tags.filter((t) => t !== tag);
	// }

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
			<select value={props.form?.values?.type || ""} name="exercise-type" id="exercise-type">
				{#each ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"] as ExerciseType[] as type}
					<option value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>
				{/each}
			</select>
		</div>
		<div class="form-group">
			<label for="question">Question *</label>
			<textarea
				id="question"
				name="question"
				value={props.form?.values?.question || ""}
				placeholder="Enter the question (5-500 chars)"
				required
				minlength="5"
				maxlength="500"
				aria-invalid={fieldErrors?.question ? "true" : "false"}
				aria-describedby={fieldErrors?.question ? "question-error" : undefined}
			></textarea>
			{#if fieldErrors?.question}
				<span id="question-error" class="field-error">{fieldErrors.question}</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="correctAnswer">Correct Answer *</label>
			<input
				type="text"
				id="correctAnswer"
				name="correctAnswer"
				value={props.form?.values?.correctAnswer || ""}
				placeholder="Enter the correct answer (1-50 chars)"
				required
				minlength="1"
				maxlength="50"
				aria-invalid={fieldErrors?.correctAnswer ? "true" : "false"}
				aria-describedby={fieldErrors?.correctAnswer ? "correctAnswer-error" : undefined}
			/>
			{#if fieldErrors?.correctAnswer}
				<span id="correctAnswer-error" class="field-error">{fieldErrors.correctAnswer}</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="">Additional Correct Answers (optional)</label>
			{#each additionalCorrectAnswers as answer, idx (idx)}
				<div class="alt-answer-row">
					<input
						type="text"
						name="additionalCorrectAnswers"
						value={answer}
						placeholder="Additional correct answer"
					/>
					<button type="button" class="btn-remove" onclick={() => removeAdditionalAnswer(idx)}>Remove</button>
				</div>
			{/each}
			<button type="button" class="btn-add" onclick={addAdditionalAnswer}>Add Another Answer</button>
			{#if fieldErrors?.additionalCorrectAnswers}
				<span class="field-error">{fieldErrors.additionalCorrectAnswers}</span>
			{/if}
		</div>

		<div class="form-group">
			<label for="">Distractors (optional)</label>
			{#each distractors as distractor, idx (idx)}
				<div class="alt-answer-row">
					<input
						type="text"
						name="distractors"
						value={distractor}
						placeholder="Distractor answer"
					/>
					<button type="button" onclick={() => removeDistractor(idx)}>Remove</button>
				</div>
			{/each}
            <button type="button" class="btn-add" onclick={addDistractor}>Add Distractor</button>
            {#if fieldErrors?.distractors}
                <span class="field-error">{fieldErrors.distractors}</span>
            {/if}
		</div>
		
		<div class="form-group">
			<label for="explanation">Explanation (optional)</label>
			<textarea
				id="explanation"
				name="explanation"
				value={props.form?.values?.explanation || ""}
				placeholder="Explain the answer (0-1000 chars)"
				maxlength="1000"
				aria-invalid={fieldErrors?.explanation ? "true" : "false"}
				aria-describedby={fieldErrors?.explanation ? "explanation-error" : undefined}
			></textarea>
			{#if fieldErrors?.explanation}
				<span id="explanation-error" class="field-error">{fieldErrors.explanation}</span>
			{/if}
		</div>

		<!-- <div class="form-group">
			<label for="tagInput">Tags (optional)</label>
			<div class="tag-input-row">
				<input
					type="text"
					id="tagInput"
					name="tagInput"
					bind:value={tagInput}
					placeholder="Add tag"
					onkeydown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
				/>
				<button type="button" onclick={addTag}>Add Tag</button>
			</div>
			{#if formData.tags.length > 0}
				<div class="tags">
					{#each formData.tags as tag (tag)}
						<input type="hidden" name="tags" value={tag} />
						<span class="tag">
							{tag}
							<button type="button" onclick={() => removeTag(tag)}>×</button>
						</span>
					{/each}
				</div>
			{/if}
			{#if fieldErrors?.tags}
				<span id="tags-error" class="field-error">{fieldErrors.tags}</span>
			{/if}
		</div> -->
		<div class="form-actions">
			<button formaction="?/create">
				{isSubmitting ? "Creating..." : "Create Exercise"}
			</button>
			<button type="button" onclick={() => goto(`/collections/view/${collectionId}`)} class="btn-cancel">
				Cancel
			</button>
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
