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

	let imageSrc = $state("");
	let showImage = $state(false);
	let imageFileName = $state("");

	let audioSrc = $state("");
	let showAudio = $state(false);
	let audioFileName = $state("");

	function handleImageFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];

		if (file) {
			showImage = true;
			imageFileName = file.name;
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				imageSrc = reader.result as string;
			});
			reader.readAsDataURL(file);
		} else {
			showImage = false;
			imageSrc = "";
			imageFileName = "";
		}
	}

	function handleAudioFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];

		if (file) {
			showAudio = true;
			audioFileName = file.name;
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				audioSrc = reader.result as string;
			});
			reader.readAsDataURL(file);
		} else {
			showAudio = false;
			audioSrc = "";
			audioFileName = "";
		}
	}

	// Load media from existing exercise
	$effect(() => {
		if (mode === "edit" && exercise) {
			if (exercise.imageUrl) {
				imageSrc = `/api/files?type=image&name=${exercise.imageUrl}`;
				imageFileName = exercise.imageUrl;
				showImage = true;
			}
			if (exercise.audioUrl) {
				audioSrc = `/api/files?type=audio&name=${exercise.audioUrl}`;
				audioFileName = exercise.audioUrl;
				showAudio = true;
			}
		}
	});

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
						Add images or audio to help with the question
					</p>

					<div style="display:flex;flex-direction:column;gap:1rem">
						<!-- Image Section -->
						<div>
							<label class="label" style="font-size:0.9rem;margin-bottom:0.5rem">Image</label>
							<div>
								<label for="image" class="muted" style="font-size:0.875rem;display:block;margin-bottom:0.25rem">
									Upload Image File
								</label>
								<input id="image" type="file" name="image" accept="image/*" onchange={handleImageFileChange} />
							</div>
							{#if exercise?.imageUrl && !imageSrc}
								<span class="muted" style="font-size:0.75rem;display:block;margin-top:0.25rem">
									Current: {exercise.imageUrl}
								</span>
							{/if}
						</div>

						<!-- Audio Section -->
						<div>
							<label class="label" style="font-size:0.9rem;margin-bottom:0.5rem">Audio</label>
							<div>
								<label for="audio" class="muted" style="font-size:0.875rem;display:block;margin-bottom:0.25rem">
									Upload Audio File
								</label>
								<input id="audio" type="file" name="audio" accept="audio/*" onchange={handleAudioFileChange} />
							</div>
							{#if exercise?.audioUrl && !audioSrc}
								<span class="muted" style="font-size:0.75rem;display:block;margin-top:0.25rem">
									Current: {exercise.audioUrl}
								</span>
							{/if}
						</div>
					</div>
				</div>
			</div>

			<!-- Media Previews -->
			<div class="two-columns">
				<!-- Image Preview -->
				{#if showImage}
					<div class="preview-container">
						<label class="label" style="font-size:0.9rem">Image Preview</label>
						<div class="preview">
							<img src={imageSrc} alt="Preview" />
						</div>
					</div>
				{/if}

				<!-- Audio Preview -->
				{#if showAudio}
					<div class="preview-container">
						<label class="label" style="font-size:0.9rem">Audio Preview</label>
						<div class="preview audio-preview">
							<audio controls style="width:100%">
								<source src={audioSrc} />
								Your browser does not support the audio element.
							</audio>
						</div>
					</div>
				{/if}
			</div>

			<!-- Form Actions -->
			<div class="form-actions">
				<Button text={formText.submitButton} type="submit" />
				<Button text="Cancel" type="button" variant="secondary" onclick={onCancel} />
			</div>
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

	.media-input-group {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 1rem;
		align-items: flex-end;
		padding: 0.75rem;
		background: #f9f9f9;
		border-radius: 6px;
		border: 1px solid #e0e0e0;
	}

	.media-input-wrapper {
		display: flex;
		flex-direction: column;
	}

	.media-input-wrapper input {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.media-input-wrapper input:focus {
		outline: none;
		border-color: #0066cc;
		box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.1);
	}

	.media-divider {
		text-align: center;
		color: #999;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.preview-container {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.preview {
		width: 100%;
		min-height: 150px;
		border: 2px solid #ddd;
		border-radius: 8px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fafafa;
		overflow: hidden;
	}

	.preview img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.audio-preview {
		padding: 1rem;
	}

	@media (max-width: 768px) {
		.media-input-group {
			grid-template-columns: 1fr;
		}

		.media-divider {
			display: none;
		}
	}
</style>