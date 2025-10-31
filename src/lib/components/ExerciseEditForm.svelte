<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import type { Snippet } from "svelte";

	
	interface Props {
		mode: "create" | "edit";
		exercise?: Exercise.ResponseDto | null;
		formErrors?: Record<string, string | string[]>;
		generalError?: string;
		onCancel: () => void;
		formAction: string;
		headerSnippet?: Snippet;
	}
	
	const modeToTitleMap: Record<Props["mode"], { title: string; submitButton: string }> = {
		create: {
			title: "Create New Exercise",
			submitButton: "Create Exercise",
		},
		edit: {
			title: "Edit Exercise",
			submitButton: "Update Exercise",
		},
	};

	let {
		mode,
		exercise = null,
		formErrors = {},
		generalError = "",
		onCancel,
		formAction,
		headerSnippet,
	}: Props = $props();

	// State for dynamic fields
	let additionalCorrectAnswers = $state<Array<{ id: number; value: string }>>([]);
	let distractors = $state<Array<{ id: number; value: string }>>([]);

	const randomId = () => Math.floor(Math.random() * 1_000_000);

	// Initialize form data from existing exercise (edit mode)
	$effect(() => {
		if (mode === "edit" && exercise) {
			additionalCorrectAnswers = (exercise.additionalCorrectAnswers || []).map((ans) => ({
				id: randomId(),
				value: ans,
			}));
			distractors = (exercise.distractors || []).map((dist) => ({
				id: randomId(),
				value: dist,
			}));
		}
	});

	// Additional correct answers management
	function addAdditionalAnswer() {
		additionalCorrectAnswers.push({ id: randomId(), value: "" });
	}

	function removeAdditionalAnswer(id: number) {
		additionalCorrectAnswers = additionalCorrectAnswers.filter((answer) => answer.id !== id);
	}

	// Distractors management
	function addDistractor() {
		distractors.push({ id: randomId(), value: "" });
	}

	function removeDistractor(id: number) {
		distractors = distractors.filter((distractor) => distractor.id !== id);
	}

	// Helper to get first error message
	function getErrorMessage(fieldErrors: string | string[] | undefined): string | undefined {
		if (!fieldErrors) return undefined;
		return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
	}

	// Form labels and texts based on mode
	const formText = $derived({
		title: modeToTitleMap[mode]?.title || "Unknown Mode",
		submitButton: modeToTitleMap[mode]?.submitButton || "Submit",
	});

	// Available exercise types
	const exerciseTypes: Exercise.ExerciseType[] = ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"];

	function formatExerciseType(type: string): string {
		return type.replaceAll("_", " ").toLowerCase();
	}
</script>

<div class="container">
	<div class="card-lg">
		{#if headerSnippet}
			{@render headerSnippet()}
		{:else}
			<h1>{formText.title}</h1>
		{/if}
	</div>

	<form
		action={formAction}
		method="POST"
		enctype="multipart/form-data"
		class="card form-card"
		style="margin-top:1rem"
		use:enhance
	>
		<!-- Error message with preserved space to prevent layout shift -->
		<div class="field-error" style="text-align: end; min-height:1.5rem">
			{#if generalError}
				{generalError}
			{/if}
		</div>

		<div class="form-grid">
			<!-- Exercise Type Selection -->
			<div class="form-group">
				<label for="type" class="label">Exercise Type</label>
				<select id="type" name="type" value={exercise?.type ?? "FILL_IN_THE_BLANK"}>
					{#each exerciseTypes as type}
						<option value={type}>{formatExerciseType(type)}</option>
					{/each}
				</select>
				{#if formErrors?.type}
					<span class="field-error">{getErrorMessage(formErrors.type)}</span>
				{/if}
			</div>

			<!-- Question Input -->
			<TextInput
				errors={getErrorMessage(formErrors?.question)}
				name="question"
				value={exercise?.question}
				label="Question *"
				placeholder="Enter the question"
				minMax={[5, 300]}
				aria-describedby="question-error"
			/>

			<!-- Correct Answer Input -->
			<TextInput
				errors={getErrorMessage(formErrors?.correctAnswer)}
				name="correctAnswer"
				value={exercise?.correctAnswer ?? undefined}
				label="Correct Answer *"
				placeholder="Enter the correct answer"
				minMax={[1, 50]}
			/>

			<!-- Two Column Layout: Additional Answers & Distractors -->
			<div class="two-columns">
				<!-- Additional Correct Answers -->
				<div class="form-group">
					<label class="label">Additional Correct Answers</label>
					<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
						Optional alternative correct answers (case-insensitive)
					</p>
					<Button text="Add Another Answer" type="button" variant="secondary" onclick={addAdditionalAnswer} />

					{#each additionalCorrectAnswers as answer (answer.id)}
						<div class="alt-answer-row">
							<TextInput
								errors={getErrorMessage(formErrors?.additionalCorrectAnswers)}
								name="additionalCorrectAnswers"
								value={answer.value}
								placeholder="Additional correct answer"
								minMax={[1, 50]}
							/>
							<Button
								text="Remove"
								type="button"
								appearance="ghost"
								onclick={() => removeAdditionalAnswer(answer.id)}
							/>
						</div>
					{/each}
				</div>

				<!-- Distractors -->
				<div class="form-group">
					<label class="label">Distractors</label>
					<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
						{#if exercise?.type === "CHOICE_SINGLE" || !exercise}
							Required for single-choice questions (minimum 5)
						{:else}
							Optional incorrect answer choices
						{/if}
					</p>
					<Button text="Add Distractor" type="button" variant="secondary" onclick={addDistractor} />

					{#each distractors as distractor (distractor.id)}
						<div class="alt-answer-row">
							<TextInput
								errors={getErrorMessage(formErrors?.distractors)}
								name="distractors"
								value={distractor.value}
								placeholder="Distractor answer"
								minMax={[1, 50]}
							/>
							<Button
								text="Remove"
								type="button"
								appearance="ghost"
								onclick={() => removeDistractor(distractor.id)}
							/>
						</div>
					{/each}
				</div>
			</div>

			<!-- Two Column Layout: Explanation & Media -->
			<div class="two-columns">
				<!-- Explanation -->
				<div class="form-group">
					<label for="explanation" class="label">Explanation</label>
					<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
						Optional explanation shown after answering
					</p>
					<textarea
						id="explanation"
						name="explanation"
						placeholder="Explain the answer (optional)"
						style="display:block;width:100%;height:80px;"
						value={exercise?.explanation ?? ""}
					></textarea>
					{#if formErrors?.explanation}
						<span class="field-error">{getErrorMessage(formErrors.explanation)}</span>
					{/if}
				</div>

				<!-- Media Files -->
				<div class="form-group">
					<label class="label">Media Files</label>
					<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
						Optional image or audio to accompany question
					</p>

					<div style="display:flex;flex-direction:column;gap:0.75rem">
						<div>
							<label
								for="image"
								class="muted"
								style="font-size:0.875rem;display:block;margin-bottom:0.25rem"
							>
								Image
							</label>
							<input id="image" type="file" name="image" accept="image/*" />
							{#if exercise?.imageUrl}
								<span class="muted" style="font-size:0.75rem;display:block;margin-top:0.25rem">
									Current: {exercise.imageUrl}
								</span>
							{/if}
						</div>

						<div>
							<label
								for="audio"
								class="muted"
								style="font-size:0.875rem;display:block;margin-bottom:0.25rem"
							>
								Audio
							</label>
							<input id="audio" type="file" name="audio" accept="audio/*" />
							{#if exercise?.audioUrl}
								<span class="muted" style="font-size:0.75rem;display:block;margin-top:0.25rem">
									Current: {exercise.audioUrl}
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Form Actions -->
		<div class="form-actions">
			<Button text={formText.submitButton} type="submit" />
			<Button text="Cancel" type="button" variant="secondary" onclick={onCancel} />
		</div>
	</form>
</div>

<style>
	.alt-answer-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-top: 0.75rem;
	}

	.alt-answer-row > :first-child {
		flex: 1;
	}

	.two-columns {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
	}

	@media (max-width: 768px) {
		.two-columns {
			grid-template-columns: 1fr;
		}
	}
</style>
