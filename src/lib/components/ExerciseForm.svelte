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
	let imageStatus = $state<"new" | "existing" | "unchanged">("unchanged");

	let audioSrc = $state("");
	let showAudio = $state(false);
	let audioFileName = $state("");
	let audioStatus = $state<"new" | "existing" | "unchanged">("unchanged");

	function handleImageFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			showImage = true;
			imageFileName = file.name;
			imageStatus = "new";
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				imageSrc = reader.result as string;
			});
			reader.readAsDataURL(file);
		} else {
			showImage = false;
			imageSrc = "";
			imageFileName = "";
			imageStatus = exercise?.imageUrl ? "existing" : "unchanged";
		}
	}

	function handleAudioFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		console.log("Selected audio file:", file);
		if (file) {
			showAudio = true;
			audioFileName = file.name;
			audioStatus = "new";
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				audioSrc = reader.result as string;
			});
			reader.readAsDataURL(file);
		} else {
			showAudio = false;
			audioSrc = "";
			audioFileName = "";
			audioStatus = exercise?.audioUrl ? "existing" : "unchanged";
		}
	}

	// Load media from existing exercise
	$effect(() => {
		if (mode === "edit" && exercise) {
			if (exercise.imageUrl) {
				imageSrc = `/api/files?type=image&name=${exercise.imageUrl}`;
				imageFileName = exercise.imageUrl;
				imageStatus = "existing";
				showImage = true;
			} else {
				imageStatus = "unchanged";
			}
			if (exercise.audioUrl) {
				audioSrc = `/api/files?type=audio&name=${exercise.audioUrl}`;
				audioFileName = exercise.audioUrl;
				audioStatus = "existing";
				showAudio = true;
			} else {
				audioStatus = "unchanged";
			}
		}
	});

	// Auto-show audio preview when new audio is selected
	$effect(() => {
		if (audioStatus === "new" && audioSrc) {
			showAudio = true;
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

	function clearImage() {
		imageSrc = "";
		showImage = false;
		imageFileName = "";
		imageStatus = exercise?.imageUrl ? "existing" : "unchanged";
		const fileInput = document.querySelector("#image") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
	}

	function clearAudio() {
		audioSrc = "";
		showAudio = false;
		audioFileName = "";
		audioStatus = exercise?.audioUrl ? "existing" : "unchanged";
		const fileInput = document.querySelector("#audio") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
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
						Enhance your question with images and audio
					</p>

					<div class="media-section">
						<div class="file-input-wrapper">
							<label class="file-label" for="image">Upload Image</label>
							<input
								id="image"
								type="file"
								name="image"
								accept="image/*"
								onchange={handleImageFileChange}
								class="file-input"
								title="Image"
								autocomplete="off"
							/>
						</div>
						<div class="file-input-wrapper">
							<label class="file-label" for="audio">Upload Audio</label>
							<input
								id="audio"
								type="file"
								name="audio"
								accept="audio/*"
								onchange={handleAudioFileChange}
								class="file-input"
								autocomplete="off"
							/>
						</div>
					</div>
				</div>
			</div>

			<!-- Media Previews -->
			{#if showImage || showAudio}
				<div class="preview-grid">
					{#if showImage}
						<div class="preview-card">
							<div class="preview-label">Image Preview</div>
							<div class="preview image-preview">
								<img src={imageSrc} alt="Preview" />
							</div>
						</div>
					{/if}

					{#if showAudio}
						<div class="preview-card">
							<div class="preview-label">Audio Preview</div>
							<div class="preview audio-preview">
								<audio controls src={audioSrc}>
									<!-- <source src={audioSrc} />sport the audio element. -->
								</audio>
							</div>
						</div>
					{/if}
				</div>
			{/if}

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

	.file-input {
		display: none;
	}

	.file-label {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: 2px dashed #d1d5db;
		border-radius: 10px;
		/* background: white; */
		cursor: pointer;
		transition: all 0.2s ease;
		gap: 0.5rem;
		height: 1em;
	}

	.file-label:hover {
		border-color: #0066cc;
		background: #f0f6ff1a;
	}

	.file-label:active {
		transform: scale(0.98);
	}

	/* Preview Section */
	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.preview-grid {
			grid-template-columns: 1fr;
		}
	}

	.preview-card {
		border-radius: 12px;
		overflow: hidden;
		background: white;
		border: 1.5px solid #e5e7eb;
		transition: all 0.3s ease;
	}

	.preview-card:hover {
		border-color: #d1d5db;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.preview-label {
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
		border-bottom: 1px solid #d1d5db;
	}

	.preview {
		width: 100%;
		min-height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		overflow: hidden;
	}

	.image-preview img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 1rem;
	}

	.audio-preview {
		padding: 1.5rem;
	}

	.audio-preview audio {
		width: 100%;
		accent-color: #0066cc;
	}

	.form-actions {
		display: flex;
		gap: 0.75rem;
		margin-top: 2rem;
	}

	.media-section {
		/* 2 columns for media uploads */
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}
</style>
