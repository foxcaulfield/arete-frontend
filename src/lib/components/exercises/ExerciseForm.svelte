<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/common/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import MediaField from "$lib/components/MediaField.svelte";
	import DynamicFieldsSection from "$lib/components/DynamicFieldsSection.svelte";
	import type { Snippet } from "svelte";
	import { toast } from "@zerodevx/svelte-toast";

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

	// Exercise types
	const exerciseTypes: Exercise.ExerciseType[] = ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"];

	// Dynamic fields management
	let additionalCorrectAnswers = $state<Array<{ id: number; value: string }>>([]);
	let distractors = $state<Array<{ id: number; value: string }>>([]);

	// Utility functions
	const randomId = () => Math.floor(Math.random() * 1_000_000);

	function getErrorMessage(fieldErrors: string | string[] | undefined): string | undefined {
		if (!fieldErrors) return undefined;
		return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
	}

	function formatExerciseType(type: string): string {
		return type.replaceAll("_", " ").toLowerCase();
	}

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
		additionalCorrectAnswers = additionalCorrectAnswers; // Trigger reactivity
	}

	function removeAdditionalAnswer(id: number) {
		additionalCorrectAnswers = additionalCorrectAnswers.filter((answer) => answer.id !== id);
	}

	// Distractors management
	function addDistractor() {
		distractors.push({ id: randomId(), value: "" });
		distractors = distractors; // Trigger reactivity
	}

	function removeDistractor(id: number) {
		distractors = distractors.filter((distractor) => distractor.id !== id);
	}

	// Form text derived
	const formText = $derived({
		title: modeToTitleMap[mode]?.title || "Unknown Mode",
		submitButton: modeToTitleMap[mode]?.submitButton || "Submit",
	});

	// Current exercise type (for conditional rendering)
	const currentType = $derived(exercise?.type || "FILL_IN_THE_BLANK");
</script>

<div>
	<div>
		{#if headerSnippet}
			{@render headerSnippet()}
		{:else}
			<h1>{formText.title}</h1>
		{/if}
	</div>

	<form action={formAction} method="POST" enctype="multipart/form-data" use:enhance>
		<!-- Error message with preserved space to prevent layout shift -->
		<div>
			{#if generalError}
				{generalError}
			{/if}
		</div>

		<div>
			<!-- Exercise Type Selection -->
			<div>
				<label for="type" class="label">Exercise Type</label>
				<select id="type" name="type" value={exercise?.type ?? "FILL_IN_THE_BLANK"}>
					{#each exerciseTypes as type}
						<option value={type}>{formatExerciseType(type)}</option>
					{/each}
				</select>
				{#if formErrors?.type}
					<span>{getErrorMessage(formErrors.type)}</span>
				{/if}
			</div>

			<!-- Question Input -->
			<div>
				<TextInput
					errors={getErrorMessage(formErrors?.question)}
					name="question"
					value={exercise?.question}
					label="Question *"
					placeholder="Enter the question"
					minMax={[5, 300]}
					aria-describedby="question-error"
				/>
				{#if mode === "edit"}
					<Button
						text="Copy Question"
						type="button"
						size="sm"
						color="secondary"
						onclick={() => {
							// replace all {{[^}]+}} with empty string, but keep the rest of the text
							navigator.clipboard.writeText(
								(exercise?.question || "").replace(/{/g, "").replace(/}/g, "")
							);
							toast.push("Question text copied to clipboard!", {
								theme: {
									"--toastBackground": "var(--accent)",
									"--toastColor": "var(--text)",
									"--toastBarBackground": "var(--primary)",
								},
							});
						}}
					/>
				{/if}
			</div>

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
				<DynamicFieldsSection
					label="Additional Correct Answers"
					name="additionalCorrectAnswers"
					description="Optional alternative correct answers (case-insensitive)"
					items={additionalCorrectAnswers}
					placeholder="Additional correct answer"
					onAdd={addAdditionalAnswer}
					onRemove={removeAdditionalAnswer}
					errors={formErrors?.additionalCorrectAnswers}
					minMax={[1, 50]}
				/>

				<!-- Distractors -->
				<DynamicFieldsSection
					label="Distractors"
					name="distractors"
					description={currentType === "CHOICE_SINGLE"
						? "Required for single-choice questions (minimum 5)"
						: "Optional incorrect answer choices"}
					items={distractors}
					placeholder="Distractor answer"
					onAdd={addDistractor}
					onRemove={removeDistractor}
					errors={formErrors?.distractors}
					minMax={[1, 50]}
				/>
			</div>

			<!-- Two Column Layout: Explanation & Media -->
			<div>
				<!-- Explanation -->
				<div>
					<label for="explanation" class="label">Explanation</label>
					<p>Optional explanation shown after answering</p>
					<textarea
						id="explanation"
						name="explanation"
						placeholder="Explain the answer (optional)"
						value={exercise?.explanation ?? ""}
					></textarea>
					{#if formErrors?.explanation}
						<span>{getErrorMessage(formErrors.explanation)}</span>
					{/if}
				</div>

				<!-- Media Files -->
				<MediaField imageUrl={exercise?.imageUrl} audioUrl={exercise?.audioUrl} />
			</div>

			<!-- Form Actions -->
			<div>
				<Button text={formText.submitButton} type="submit" />
				<Button text="Cancel" type="button" color="secondary" onclick={onCancel} />
			</div>
		</div>
	</form>
</div>
