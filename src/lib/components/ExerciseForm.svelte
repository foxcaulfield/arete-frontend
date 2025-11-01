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
						<!-- Image Upload -->
						<!-- <div class="media-card"> -->
						<!-- <div class="media-header">
								<div class="media-icon image-icon">🖼️</div>
								<div class="media-title-group">
									<h4 class="media-title">Image</h4>
									<p class="media-subtitle">Visual aid for the question</p>
								</div>
							</div> -->
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
							<!-- <label for="image" class="file-label">
									<svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path
											d="M12 2v20M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5"
											stroke-width="2"
											stroke-linecap="round"
										/>
									</svg>
									<span>Click to upload or drag & drop</span>
									<span class="file-hint">PNG, JPG, GIF up to 10MB</span>
								</label> -->
						</div>
						<!-- 
							{#if imageStatus === "existing"}
								<div class="status-badge existing-badge">
									<span class="badge-icon">✓</span>
									<div class="badge-content">
										<span class="badge-label">Saved</span>
										<span class="badge-filename">{imageFileName}</span>
									</div>
									{#if imageStatus === "existing"}
										<button type="button" class="badge-action" onclick={clearImage}>Replace</button>
									{/if}
								</div>
							{:else if imageStatus === "new"}
								<div class="status-badge new-badge">
									<span class="badge-icon">★</span>
									<div class="badge-content">
										<span class="badge-label">Ready to Upload</span>
										<span class="badge-filename">{imageFileName}</span>
									</div>
									<button type="button" class="badge-action" onclick={clearImage}>Clear</button>
								</div>
							{/if} -->
						<!-- </div> -->

						<!-- Audio Upload -->
						<!-- <div class="media-card"> -->
						<!-- <div class="media-header">
								<div class="media-icon audio-icon">🎵</div>
								<div class="media-title-group">
									<h4 class="media-title">Audio</h4>
									<p class="media-subtitle">Pronunciation or explanation</p>
								</div>
							</div> -->
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
							<!-- <label for="audio" class="file-label">
									<svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
										<path
											d="M12 2v20M2 12h20M7 7l5-5 5 5M7 17l5 5 5-5"
											stroke-width="2"
											stroke-linecap="round"
										/>
									</svg>
									<span>Click to upload or drag & drop</span>
									<span class="file-hint">MP3, WAV, M4A up to 20MB</span>
								</label> -->
						</div>

						<!-- {#if audioStatus === "existing"}
								<div class="status-badge existing-badge">
									<span class="badge-icon">✓</span>
									<div class="badge-content">
										<span class="badge-label">Saved</span>
										<span class="badge-filename">{audioFileName}</span>
									</div>
									{#if audioStatus === "existing"}
										<button type="button" class="badge-action" onclick={clearAudio}>Replace</button>
									{/if}
								</div>
							{:else if audioStatus === "new"}
								<div class="status-badge new-badge">
									<span class="badge-icon">★</span>
									<div class="badge-content">
										<span class="badge-label">Ready to Upload</span>
										<span class="badge-filename">{audioFileName}</span>
									</div>
									<button type="button" class="badge-action" onclick={clearAudio}>Clear</button>
								</div>
							{/if} -->
						<!-- </div> -->
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

	/* Media Section Styling */

	.media-card {
		border: 1.5px solid #e5e7eb;
		border-radius: 12px;
		padding: 1.5rem;
		background: linear-gradient(135deg, #fafbfc 0%, #f3f4f6 100%);
		transition: all 0.3s ease;
	}

	.media-card:hover {
		border-color: #d1d5db;
		background: linear-gradient(135deg, #f8fafb 0%, #f1f3f5 100%);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
	}

	.media-header {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		margin-bottom: 1.25rem;
	}

	.media-icon {
		font-size: 2rem;
		flex-shrink: 0;
	}

	.media-title-group {
		flex: 1;
	}

	.media-title {
		font-size: 1rem;
		font-weight: 600;
		margin: 0;
		color: #1f2937;
		letter-spacing: -0.01em;
	}

	.media-subtitle {
		font-size: 0.8rem;
		color: #6b7280;
		margin: 0.25rem 0 0 0;
	}

	.file-input-wrapper {
		/* position: relative; */
		/* margin-bottom: 1rem; */
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

	.upload-icon {
		width: 28px;
		height: 28px;
		color: #9ca3af;
		transition: color 0.2s ease;
	}

	.file-label:hover .upload-icon {
		color: #0066cc;
	}

	.file-label span:first-of-type {
		font-weight: 500;
		color: #374151;
		font-size: 0.95rem;
	}

	.file-hint {
		font-size: 0.8rem;
		color: #9ca3af;
	}

	/* Status Badges */
	.status-badge {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		padding: 0.875rem 1rem;
		border-radius: 10px;
		font-size: 0.875rem;
		border: 1.5px solid;
		transition: all 0.2s ease;
	}

	.existing-badge {
		background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
		border-color: #7dd3fc;
		color: #0369a1;
	}

	.new-badge {
		background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
		border-color: #fcd34d;
		color: #92400e;
	}

	.badge-icon {
		font-weight: bold;
		font-size: 1.1rem;
		flex-shrink: 0;
	}

	.existing-badge .badge-icon {
		color: #0891b2;
	}

	.new-badge .badge-icon {
		color: #f59e0b;
	}

	.badge-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.badge-label {
		font-weight: 600;
		font-size: 0.85rem;
		letter-spacing: 0.5px;
		text-transform: uppercase;
	}

	.badge-filename {
		font-size: 0.8rem;
		opacity: 0.8;
		word-break: break-word;
	}

	.badge-action {
		flex-shrink: 0;
		padding: 0.4rem 0.8rem;
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.5);
		border-radius: 6px;
		font-size: 0.8rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		color: inherit;
	}

	.badge-action:hover {
		background: rgba(255, 255, 255, 0.9);
		transform: translateY(-1px);
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
