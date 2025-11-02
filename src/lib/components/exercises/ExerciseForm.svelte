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

	// Form text derived
	const formText = $derived({
		title: modeToTitleMap[mode]?.title || "Unknown Mode",
		submitButton: modeToTitleMap[mode]?.submitButton || "Submit",
	});
</script>

<!-- Main Form Container -->
<div class="w-full min-h-screen p-4 md:p-6 lg:p-8">
	<div class="max-w-4xl mx-auto">
		<!-- Header Section -->
		<div class="mb-8">
			{#if headerSnippet}
				{@render headerSnippet()}
			{:else}
				<h1 class="h1 font-bold">{formText.title}</h1>
			{/if}
		</div>

		<!-- Error Alert -->
		{#if generalError}
			<div class="mb-6 p-4 bg-error-900 border border-error-800 rounded-lg flex items-start gap-3">
				<svg class="w-5 h-5 text-error-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<div class="text-sm text-error-500 font-medium">{generalError}</div>
			</div>
		{/if}

		<!-- Form Card -->
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
			class="bg-surface-900 rounded-xl border border-surface-700 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
		>
			<div class="p-6 md:p-8 space-y-6">
				<!-- Section 1: Exercise Type & Question -->
				<div class="space-y-5">
					<div class="border-b border-surface-700 pb-4">
						<h2 class="text-lg font-semibold text-surface-100">Exercise Configuration</h2>
						<p class="text-sm text-surface-400 mt-1">Set up the exercise type and question</p>
					</div>

					<!-- Exercise Type Selection -->
					<div class="form-group">
						<label for="type" class="block text-sm font-medium text-surface-100 mb-2">
							Exercise Type
							<span class="text-error-600">*</span>
						</label>
						<select
							id="type"
							name="type"
							value={exercise?.type ?? "FILL_IN_THE_BLANK"}
							class="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
						>
							{#each exerciseTypes as type}
								<option value={type}>{formatExerciseType(type)}</option>
							{/each}
						</select>
						{#if formErrors?.type}
							<p class="mt-1.5 text-sm text-error-600 font-medium">
								{getErrorMessage(formErrors.type)}
							</p>
						{/if}
					</div>

					<!-- Question Input -->
					<div class="form-group">
						<label for="question" class="block text-sm font-medium text-surface-100 mb-2">
							Question
							<span class="text-error-600">*</span>
						</label>
						<textarea
							id="question"
							name="question"
							value={exercise?.question ?? ""}
							autocomplete="off"
							placeholder="Enter the question (5-300 characters)"
							maxlength="300"
							rows="3"
							class="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
						></textarea>
						<div class="mt-1 flex items-center justify-between">
							<div>
								{#if formErrors?.question}
									<p class="text-sm text-error-600 font-medium">
										{Array.isArray(formErrors.question)
											? formErrors.question.join(", ")
											: formErrors.question}
									</p>
								{/if}
							</div>
							{#if mode === "edit"}
								<Button
									text="Copy Question"
									type="button"
									size="sm"
									color="secondary"
									preset="outlined"
									onclick={() => {
										navigator.clipboard.writeText(
											(exercise?.question || "").replace(/{/g, "").replace(/}/g, "")
										);
										toast.push("Question copied to clipboard!", {
											theme: {
												"--toastBackground": "var(--color-success-500)",
												"--toastColor": "white",
												"--toastBarBackground": "var(--color-success-700)",
											},
										});
									}}
								/>
							{/if}
						</div>
					</div>
				</div>

				<!-- Section 2: Answers -->
				<div class="space-y-5">
					<div class="border-b border-surface-700 pb-4">
						<h2 class="text-lg font-semibold text-surface-100">Answer Configuration</h2>
						<p class="text-sm text-surface-400 mt-1">Define correct answers and incorrect options</p>
					</div>

					<!-- Correct Answer -->
					<div class="form-group">
						<label for="correctAnswer" class="block text-sm font-medium text-surface-100 mb-2">
							Correct Answer
							<span class="text-error-600">*</span>
						</label>
						<input
							id="correctAnswer"
							type="text"
							name="correctAnswer"
							value={exercise?.correctAnswer ?? ""}
							autocomplete="off"
							placeholder="Enter the correct answer"
							maxlength="50"
							class="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
						/>
						{#if formErrors?.correctAnswer}
							<p class="mt-1.5 text-sm text-error-600 font-medium">
								{Array.isArray(formErrors.correctAnswer)
									? formErrors.correctAnswer.join(", ")
									: formErrors.correctAnswer}
							</p>
						{/if}
					</div>

					<!-- Two Column Layout: Additional Answers & Distractors -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<!-- Alternative Correct Answers -->
						<div class="form-group">
							<TagsInput
								onValueChange={({ value }) => {
									additionalCorrectAnswers = value.map((val) => ({
										id: randomId(),
										value: val,
									}));
								}}
								value={additionalCorrectAnswers.map((d) => d.value)}
							>
								<TagsInput.Label class="block text-sm font-medium text-surface-100 mb-2">
									Alternative Correct Answers
								</TagsInput.Label>
								<TagsInput.Control class="w-full">
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
									<TagsInput.Input
										placeholder="Type and press Enter to add..."
										class="w-full px-3 py-2 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-800"
									/>
								</TagsInput.Control>
								<TagsInput.ClearTrigger class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">
									Clear All
								</TagsInput.ClearTrigger>
								<TagsInput.HiddenInput />
							</TagsInput>
						</div>

						<!-- Distractors -->
						<div class="form-group">
							<TagsInput
								onValueChange={({ value }) => {
									distractors = value.map((val) => ({
										id: randomId(),
										value: val,
									}));
								}}
								value={distractors.map((d) => d.value)}
							>
								<TagsInput.Label class="block text-sm font-medium text-surface-100 mb-2">
									Distractors (Wrong Answers)
								</TagsInput.Label>
								<TagsInput.Control class="w-full">
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
									<TagsInput.Input
										placeholder="Type and press Enter to add..."
										class="w-full px-3 py-2 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-surface-800"
									/>
								</TagsInput.Control>
								<TagsInput.ClearTrigger class="mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium">
									Clear All
								</TagsInput.ClearTrigger>
								<TagsInput.HiddenInput />
							</TagsInput>
						</div>
					</div>
				</div>

				<!-- Section 3: Explanation & Media -->
				<div class="space-y-5">
					<div class="border-b border-surface-700 pb-4">
						<h2 class="text-lg font-semibold text-surface-100">Additional Content</h2>
						<p class="text-sm text-surface-400 mt-1">Add explanations and media files</p>
					</div>

					<!-- Explanation -->
					<div class="form-group">
						<label for="explanation" class="block text-sm font-medium text-surface-100 mb-1">
							Explanation
						</label>
						<p class="text-xs text-surface-400 mb-2">Shown after the answer is submitted (optional)</p>
						<textarea
							id="explanation"
							name="explanation"
							value={exercise?.explanation ?? ""}
							placeholder="Explain why this answer is correct..."
							rows="4"
							class="w-full px-4 py-2.5 bg-surface-800 border border-surface-600 rounded-lg text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors resize-none"
						></textarea>
						{#if formErrors?.explanation}
							<p class="mt-1.5 text-sm text-error-600 font-medium">
								{getErrorMessage(formErrors.explanation)}
							</p>
						{/if}
					</div>

					<!-- Media Files -->
					<div>
						<MediaField imageUrl={exercise?.imageUrl} audioUrl={exercise?.audioUrl} />
					</div>
				</div>
			</div>

			<!-- Form Actions -->
			<div class="px-6 md:px-8 py-4 bg-surface-800 border-t border-surface-700 flex gap-3 justify-end">
				<Button
					text="Cancel"
					type="button"
					color="secondary"
					preset="outlined"
					onclick={onCancel}
				/>
				<Button
					text={formText.submitButton}
					type="submit"
					color="primary"
				/>
			</div>
		</form>
	</div>
</div>
