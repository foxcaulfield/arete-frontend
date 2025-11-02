<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/common/Button.svelte";
	import TextInput from "$lib/components/common/TextInput.svelte";
	import MediaField from "$lib/components/MediaField.svelte";
	import type { Snippet } from "svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { TagsInput } from "@skeletonlabs/skeleton-svelte";
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

	<form
		action={formAction}
		method="POST"
		enctype="multipart/form-data"
		use:enhance={async ({ formData }) => {
			distractors?.forEach((distractor) => {
				formData.append(`distractors`, distractor.value);
			});
			additionalCorrectAnswers?.forEach((answer, index) => {
				formData.append(`additionalCorrectAnswers`, answer.value);
			});
			return async ({ update }) => {
				await update();
			};
			// Custom enhancement logic can go here
		}}
	>
		<!-- Error message with preserved space to prevent layout shift -->
		<div>
			{#if generalError}
				{generalError}
			{/if}
		</div>

		<div>
			<!-- Exercise Type Selection -->
			<div>
				<label for="type" class="label">
					<span class="label-text">Exercise Type</span>
					<select class="select" id="type" name="type" value={exercise?.type ?? "FILL_IN_THE_BLANK"}>
						{#each exerciseTypes as type}
							<option value={type}>{formatExerciseType(type)}</option>
						{/each}
					</select>
				</label>
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
			<div>

				<TagsInput
					onValueChange={({ value }) => {
						additionalCorrectAnswers = value.map((val) => ({ id: randomId(), value: val }));
						console.log("Selected tags:", value);
					}}
					value={additionalCorrectAnswers.map((d) => d.value)}
				>
					<TagsInput.Label>Alternative Correct Answers</TagsInput.Label>
					<TagsInput.Control>
						<TagsInput.Context>
							{#snippet children(tagsInput)}
								{#each tagsInput().value as value, index (index)}
									<TagsInput.Item {value} {index}>
										<TagsInput.ItemPreview>
											<TagsInput.ItemText>{value}</TagsInput.ItemText>
											<TagsInput.ItemDeleteTrigger />
										</TagsInput.ItemPreview>
										<TagsInput.ItemInput />
									</TagsInput.Item>
								{/each}
							{/snippet}
						</TagsInput.Context>
						<TagsInput.Input placeholder="Alt answers..." />
					</TagsInput.Control>
					<TagsInput.ClearTrigger>Clear All</TagsInput.ClearTrigger>
					<TagsInput.HiddenInput />
				</TagsInput>

				<!-- Distractors -->

				<TagsInput
					onValueChange={({ value }) => {
						distractors = value.map((val) => ({ id: randomId(), value: val }));
						console.log("Selected tags:", value);
					}}
					value={distractors.map((d) => d.value)}
				>
					<TagsInput.Label>Distractors</TagsInput.Label>
					<TagsInput.Control>
						<TagsInput.Context>
							{#snippet children(tagsInput)}
								{#each tagsInput().value as value, index (index)}
									<TagsInput.Item {value} {index}>
										<TagsInput.ItemPreview>
											<TagsInput.ItemText>{value}</TagsInput.ItemText>
											<TagsInput.ItemDeleteTrigger />
										</TagsInput.ItemPreview>
										<TagsInput.ItemInput />
									</TagsInput.Item>
								{/each}
							{/snippet}
						</TagsInput.Context>
						<TagsInput.Input placeholder="Distractors..." />
					</TagsInput.Control>
					<TagsInput.ClearTrigger>Clear All</TagsInput.ClearTrigger>
					<TagsInput.HiddenInput />
				</TagsInput>
			</div>

			<!-- Two Column Layout: Explanation & Media -->
			<div>
				<!-- Explanation -->
				<div>
					<label for="explanation" class="label">
						<p>Optional explanation shown after answering</p>
						<textarea
							class="textarea"
							id="explanation"
							name="explanation"
							placeholder="Explain the answer (optional)"
							value={exercise?.explanation ?? ""}
						></textarea>
					</label>
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
