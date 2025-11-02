<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/common/Button.svelte";
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

	// UI State
	let questionLength = $state(exercise?.question?.length ?? 0);
	let expandAdvanced = $state(false);

	// Utility functions
	const randomId = () => Math.floor(Math.random() * 1_000_000);

	function getErrorMessage(fieldErrors: string | string[] | undefined): string | undefined {
		if (!fieldErrors) return undefined;
		return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
	}

	function formatExerciseType(type: string): string {
		return type.replaceAll("_", " ").toLowerCase();
	}

	function getExerciseTypeDescription(type: string): string {
		const descriptions: Record<string, string> = {
			FILL_IN_THE_BLANK: "Type the answer",
			CHOICE_SINGLE: "Select one option",
		};
		return descriptions[type] ?? "";
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
			questionLength = exercise.question?.length ?? 0;
		}
	});

	// Form text derived
	const formText = $derived({
		title: modeToTitleMap[mode]?.title || "Unknown Mode",
		submitButton: modeToTitleMap[mode]?.submitButton || "Submit",
	});

	// Validation helpers
	const hasQuestionError = $derived(!!formErrors?.question);
	const hasAnswerError = $derived(!!formErrors?.correctAnswer);
	const hasTypeError = $derived(!!formErrors?.type);
	const questionMinLength = 5;
	const questionMaxLength = 300;
	const answerMaxLength = 50;

	// Derived state for exercise type
	const currentExerciseType = $derived(exercise?.type ?? "FILL_IN_THE_BLANK");
	const isChoiceSingle = $derived(currentExerciseType === "CHOICE_SINGLE");
</script>

<!-- Main Form Container -->
<div class="w-full p-4 md:p-6">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6">
			{#if headerSnippet}
				{@render headerSnippet()}
			{:else}
				<h1 class="h3 font-bold">{formText.title}</h1>
			{/if}
		</div>

		<!-- Error Alert -->
		{#if generalError}
			<div
				class="mb-4 flex items-start gap-2 rounded-lg border border-error-800 bg-error-900 p-3 text-sm text-error-400"
			>
				<svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<div>{generalError}</div>
			</div>
		{/if}

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
			}}
			class="space-y-4"
		>
			<!-- Row 1: Type & Question -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<!-- Exercise Type -->
				<div class="lg:col-span-1">
					<label class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase">
						Type
						<span class="text-error-600">*</span>
					</label>
					<div class="space-y-2">
						{#each exerciseTypes as type}
							<label
								class="flex cursor-pointer items-center rounded border border-surface-600 p-2 transition-colors peer-has-checked:border-primary-500 hover:bg-surface-800"
							>
								<input
									type="radio"
									name="type"
									value={type}
									checked={exercise?.type === type}
									class="h-4 w-4"
								/>
								<span class="ml-2 text-sm text-surface-100">{formatExerciseType(type)}</span>
							</label>
						{/each}
						<label
							class="flex pointer-events-none opacity-50 items-center rounded border border-surface-600 p-2 transition-colors peer-has-checked:border-primary-500 hover:bg-surface-800"
						>
							<input disabled type="radio" />
							<span class="ml-2 text-sm text-surface-100">Rearrange</span>
						</label>
					</div>
					{#if formErrors?.type}
						<p class="mt-1 text-xs text-error-500">{getErrorMessage(formErrors.type)}</p>
					{/if}
				</div>

				<!-- Question -->
				<div class="lg:col-span-2">
					<div class="mb-2 flex items-center justify-between">
						<label
							for="question"
							class="block text-xs font-semibold tracking-wide text-surface-300 uppercase"
						>
							Question <span class="text-error-600">*</span>
						</label>
						<span class="text-xs text-surface-500">{questionLength}/{questionMaxLength}</span>
					</div>
					<textarea
						id="question"
						name="question"
						value={exercise?.question ?? ""}
						autocomplete="off"
						placeholder="What is the capital of France?"
						maxlength={questionMaxLength}
						rows="2"
						onchange={(e) => {
							questionLength = (e.target as HTMLTextAreaElement).value.length;
						}}
						oninput={(e) => {
							questionLength = (e.target as HTMLTextAreaElement).value.length;
						}}
						class={`w-full resize-none rounded border bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none ${
							hasQuestionError ? "border-error-600" : "border-surface-600"
						}`}
					></textarea>
					<div class="mt-1 flex items-center justify-between">
						<div>
							{#if hasQuestionError}
								<p class="text-xs text-error-500">
									{Array.isArray(formErrors.question)
										? formErrors.question.join(", ")
										: formErrors.question}
								</p>
							{:else if questionLength < questionMinLength}
								<p class="text-xs text-surface-400">Min {questionMinLength} chars</p>
							{:else}
								<p class="text-xs text-success-500">✓</p>
							{/if}
						</div>
						{#if mode === "edit"}
							<button
								type="button"
								class="text-xs text-primary-500 hover:text-primary-400"
								onclick={() => {
									navigator.clipboard.writeText(
										(exercise?.question || "").replace(/{/g, "").replace(/}/g, "")
									);
									toast.push("Copied!", {
										theme: {
											"--toastBackground": "var(--color-success-500)",
											"--toastColor": "white",
											"--toastBarBackground": "var(--color-success-700)",
										},
									});
								}}
							>
								Copy
							</button>
						{/if}
					</div>
					<hr class="my-4 border-surface-600" />
					<!-- Correct Answer -->
					<div>
						<label
							for="correctAnswer"
							class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase"
						>
							Correct Answer <span class="text-error-600">*</span>
						</label>
						<input
							id="correctAnswer"
							type="text"
							name="correctAnswer"
							value={exercise?.correctAnswer ?? ""}
							autocomplete="off"
							placeholder="Paris"
							maxlength={answerMaxLength}
							class={`w-full rounded border bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none ${
								hasAnswerError ? "border-error-600" : "border-surface-600"
							}`}
						/>
						{#if hasAnswerError}
							<p class="mt-1 text-xs text-error-500">
								{Array.isArray(formErrors.correctAnswer)
									? formErrors.correctAnswer.join(", ")
									: formErrors.correctAnswer}
							</p>
						{/if}
					</div>
				</div>
			</div>

			<!-- Row 2: Answers -->
			<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
				<!-- Alternative/Additional Correct Answers -->
				<div class="lg:col-span-1">
					<label class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase">
						Alternatives (Optional)
					</label>
					<TagsInput
						onValueChange={({ value }) => {
							additionalCorrectAnswers = value.map((val) => ({
								id: randomId(),
								value: val,
							}));
						}}
						value={additionalCorrectAnswers.map((d) => d.value)}
					>
						<TagsInput.Control class="w-full">
							<TagsInput.Context>
								{#snippet children(tagsInput)}
									<div class="mb-2 flex flex-wrap gap-1">
										{#each tagsInput().value as value, index (index)}
											<TagsInput.Item {value} {index}>
												<TagsInput.ItemPreview>
													<div
														class="flex items-center gap-1 rounded border border-success-700 bg-success-900 px-1.5 py-0.5"
													>
														<span class="text-xs text-surface-100">{value}</span>
														<TagsInput.ItemDeleteTrigger
															class="cursor-pointer text-success-600 hover:text-success-500"
														/>
													</div>
												</TagsInput.ItemPreview>
												<TagsInput.ItemInput />
											</TagsInput.Item>
										{/each}
									</div>
								{/snippet}
							</TagsInput.Context>
							<TagsInput.Input
								placeholder="paris, PARIS, Île de France..."
								class="w-full rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
							/>
						</TagsInput.Control>
						<TagsInput.HiddenInput />
					</TagsInput>
					<p class="mt-1 text-xs text-surface-400">{additionalCorrectAnswers.length} added</p>
				</div>

				<!-- Row 3: Wrong Answers (Always Visible) -->
				<div class="lg:col-span-2">
					<label class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase">
						Wrong Answers
					</label>
					<TagsInput
						onValueChange={({ value }) => {
							distractors = value.map((val) => ({
								id: randomId(),
								value: val,
							}));
						}}
						value={distractors.map((d) => d.value)}
					>
						<TagsInput.Control class="w-full">
							<TagsInput.Context>
								{#snippet children(tagsInput)}
									<div class="mb-2 flex flex-wrap gap-1">
										{#each tagsInput().value as value, index (index)}
											<TagsInput.Item {value} {index}>
												<TagsInput.ItemPreview>
													<div
														class="flex items-center gap-1 rounded border border-error-700 bg-error-900 px-1.5 py-0.5"
													>
														<span class="text-xs text-surface-100">{value}</span>
														<TagsInput.ItemDeleteTrigger
															class="cursor-pointer text-error-600 hover:text-error-500"
														/>
													</div>
												</TagsInput.ItemPreview>
												<TagsInput.ItemInput />
											</TagsInput.Item>
										{/each}
									</div>
								{/snippet}
							</TagsInput.Context>
							<TagsInput.Input
								placeholder="london, berlin, madrid..."
								class="w-full rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
							/>
						</TagsInput.Control>
						<TagsInput.HiddenInput />
					</TagsInput>
					<p class="mt-1 text-xs text-surface-400">{distractors.length}/4 added</p>
				</div>
			</div>

			<!-- Row 4: Explanation (Collapsible) -->
			<details class="border-t border-surface-700 pt-4">
				<summary
					class="cursor-pointer text-xs font-semibold tracking-wide text-surface-300 uppercase hover:text-surface-200"
				>
					+ Explanation (Optional)
				</summary>
				<div class="mt-3">
					<textarea
						id="explanation"
						name="explanation"
						value={exercise?.explanation ?? ""}
						placeholder="Why is this the correct answer?"
						rows="3"
						class="w-full resize-none rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
					></textarea>
					{#if formErrors?.explanation}
						<p class="mt-1 text-xs text-error-500">{getErrorMessage(formErrors.explanation)}</p>
					{/if}
				</div>
			</details>

			<!-- Row 5: Media (Collapsible) -->
			<details class="border-t border-surface-700 pt-4">
				<summary
					class="cursor-pointer text-xs font-semibold tracking-wide text-surface-300 uppercase hover:text-surface-200"
				>
					+ Media Files (Optional)
				</summary>
				<div class="mt-3">
					<MediaField imageUrl={exercise?.imageUrl} audioUrl={exercise?.audioUrl} />
				</div>
			</details>

			<!-- Form Actions -->
			<div class="mt-6 flex items-center justify-between gap-2 border-t border-surface-700 pt-4">
				<div class="text-xs text-surface-400">
					{#if hasQuestionError || hasAnswerError || hasTypeError}
						<span class="font-medium text-error-500">Please fix errors</span>
					{:else if questionLength >= questionMinLength && exercise?.correctAnswer}
						<span class="font-medium text-success-500">Ready ✓</span>
					{:else}
						<span>Fill required fields</span>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button
						text="Cancel"
						type="button"
						color="secondary"
						preset="outlined"
						size="sm"
						onclick={onCancel}
					/>
					<Button
						text={formText.submitButton}
						type="submit"
						color="primary"
						size="sm"
						disabled={hasQuestionError ||
							hasAnswerError ||
							hasTypeError ||
							questionLength < questionMinLength}
					/>
				</div>
			</div>
		</form>
	</div>
</div>

<style>
	details summary {
		user-select: none;
	}

	details summary::-webkit-details-marker {
		display: none;
	}
</style>
