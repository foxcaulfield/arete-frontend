<script lang="ts">
	import { enhance } from "$app/forms";
	import Button from "$lib/components/common/Button.svelte";
	import MediaField from "$lib/components/MediaField.svelte";
	import type { Snippet } from "svelte";
	import { toast } from "@zerodevx/svelte-toast";
	import { TagsInput } from "@skeletonlabs/skeleton-svelte";

	interface Props {
		mode: "create" | "edit";
		formTitle: string;
		submitButtonText: string;
		exercise?: Exercise.ResponseDto | null;
		formErrors?: Record<string, string | string[]>;
		generalError?: string;
		onCancel: () => void;
		handleDelete?: () => void;
		formAction: string;
		headerSnippet?: Snippet;
	}

	let {
		mode,
		exercise = null,
		formErrors = {},
		generalError = "",
		onCancel,
		handleDelete,
		formAction,
		headerSnippet,
		formTitle,
		submitButtonText,
	}: Props = $props();

	// Exercise types
	const exerciseTypes: Exercise.ExerciseType[] = ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"];

	// Utility functions
	const randomId = () => Math.floor(Math.random() * 1_000_000);

	// Form state - initialize once from props
	let selectedType = $state<Exercise.ExerciseType | undefined>(exercise?.type);
	let questionText = $state(exercise?.question ?? "");
	let translationText = $state(exercise?.translation ?? "");
	let correctAnswerText = $state(exercise?.correctAnswer ?? "");
	let explanationText = $state(exercise?.explanation ?? "");

	// Track if fields should be explicitly set to null
	let clearExplanation = $state(false);
	let clearTranslation = $state(false);
	let clearAdditionalAnswers = $state(false);
	let clearDistractors = $state(false);

	let additionalCorrectAnswers = $state<Array<{ id: number; value: string }>>(
		(exercise?.additionalCorrectAnswers || []).map((ans) => ({ id: randomId(), value: ans }))
	);
	let distractors = $state<Array<{ id: number; value: string }>>(
		(exercise?.distractors || []).map((dist) => ({ id: randomId(), value: dist }))
	);

	// Derived UI state
	let questionLength = $derived(questionText.length);
	let translationLength = $derived(translationText.length);

	function getErrorMessage(fieldErrors: string | string[] | undefined): string | undefined {
		if (!fieldErrors) return undefined;
		return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
	}

	function formatExerciseType(type: string): string {
		return type.replaceAll("_", " ").toLowerCase();
	}

	// Validation helpers
	const hasQuestionError = $derived(!!formErrors?.question);
	const hasAnswerError = $derived(!!formErrors?.correctAnswer);
	const hasTypeError = $derived(!!formErrors?.type);
	const questionMinLength = 5;
	const questionMaxLength = 300;
	const answerMaxLength = 50;
	const translationMaxLength = 300;
</script>

<!-- Main Form Container -->
<div class="w-full p-4 md:p-6">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between gap-4">
			<div>
				{#if headerSnippet}
					{@render headerSnippet()}
				{:else}
					<h1 class="h3 font-bold">{formTitle}</h1>
				{/if}
			</div>
			{#if mode === "edit"}
				<Button text="Delete" type="button" color="error" preset="outlined" size="sm" onclick={handleDelete} />
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
				// Handle distractors array
				// distractors?.forEach((distractor) => {
				// 	formData.append(`distractors`, distractor.value);
				// });

				// Handle additional correct answers array
				// Always send values (empty array if none, which will be handled as empty on backend)
				if (clearAdditionalAnswers || additionalCorrectAnswers.length === 0) {
					// Send empty array marker so backend knows to set it to []
					formData.append("additionalCorrectAnswers", "EMPTY_ARRAY");
				} else {
					const uniqueAnswers = [...new Set(additionalCorrectAnswers.map(a => a.value))];

					uniqueAnswers.forEach((answer) => {
						formData.append(`additionalCorrectAnswers`, answer);
					});
				}

				if (clearDistractors || distractors.length === 0) {
					// Send empty array marker so backend knows to set it to []
					formData.append("distractors", "EMPTY_ARRAY");
				} else {
					const uniqueDistractors = [...new Set(distractors.map(d => d.value))];

					uniqueDistractors.forEach((dist) => {
						formData.append(`distractors`, dist);
					});
				}

				// Handle explicit null for text fields
				if (clearExplanation || explanationText.trim().length === 0) {
					formData.set("explanation", "NULL");
				}
				if (clearTranslation || translationText.trim().length === 0) {
					formData.set("translation", "NULL");
				}
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
					<label
						for="exercise-type-radio-0"
						class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase"
					>
						Type
						<span class="text-error-600">*</span>
					</label>
					<div class="space-y-2">
						{#each exerciseTypes as type, i}
							<label
								class="flex cursor-pointer items-center rounded border border-surface-600 p-2 transition-colors peer-has-checked:border-primary-500 hover:bg-surface-800"
							>
								<input
									id={"exercise-type-radio-" + i}
									type="radio"
									name="type"
									value={type}
									bind:group={selectedType}
									class="h-4 w-4"
								/>
								<span class="ml-2 text-sm text-surface-100">{formatExerciseType(type)}</span>
							</label>
						{/each}
						<label
							class="pointer-events-none flex items-center rounded border border-surface-600 p-2 opacity-20 transition-colors peer-has-checked:border-primary-500 hover:bg-surface-800"
						>
							<input disabled type="radio" />
							<span class="ml-2 text-sm text-surface-100">arrange</span>
						</label>
						<label
							class="pointer-events-none flex items-center rounded border border-surface-600 p-2 opacity-20 transition-colors peer-has-checked:border-primary-500 hover:bg-surface-800"
						>
							<input disabled type="radio" />
							<span class="ml-2 text-sm text-surface-100">match pairs</span>
						</label>
					</div>
					{#if formErrors?.type}
						<p class="mt-1 text-xs text-error-500">{getErrorMessage(formErrors.type)}</p>
					{/if}
				</div>

				<!-- Question -->
				<div class="lg:col-span-2">
					<div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
						<!-- Question -->
						<div>
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
								bind:value={questionText}
								autocomplete="off"
								placeholder="What is the capital of France?"
								maxlength={questionMaxLength}
								rows="2"
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
												questionText.replace(/{/g, "").replace(/}/g, "")
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
						</div>

						<!-- Translation -->
						<div>
							<div class="mb-2 flex items-center justify-between">
								<label
									for="translation"
									class="block text-xs font-semibold tracking-wide text-surface-300 uppercase"
								>
									Question Translation <span class="text-error-600">*</span>
								</label>
								<span class="text-xs text-surface-500">{translationLength}/{translationMaxLength}</span>
							</div>
							<div class="relative">
								<textarea
									disabled={clearTranslation}
									id="translation"
									name="translation"
									bind:value={translationText}
									autocomplete="off"
									placeholder="translation"
									maxlength={translationMaxLength}
									rows="2"
									class="w-full resize-none rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
								></textarea>
								{#if translationText || (mode === "edit" && exercise?.translation)}
									<button
										disabled={clearTranslation}
										type="button"
										onclick={() => {
											translationText = "";
											clearTranslation = true;
											toast.push("Translation will be removed", {
												theme: {
													"--toastBackground": "var(--color-warning-500)",
													"--toastColor": "white",
													"--toastBarBackground": "var(--color-warning-700)",
												},
											});
										}}
										class="absolute top-2 right-2 rounded p-1 text-surface-400 transition-colors hover:bg-surface-700 hover:text-surface-200 disabled:text-surface-500 disabled:hover:bg-transparent"
										title="Clear translation (set to null)"
									>
										<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M6 18L18 6M6 6l12 12"
											/>
										</svg>
									</button>
								{/if}
							</div>
							{#if clearTranslation}
								<p class="mt-1 text-xs text-warning-500">
									Translation will be removed
									<button
										type="button"
										onclick={() => {
											clearTranslation = false;
											translationText = exercise?.translation ?? "";
										}}
										class="ml-2 underline hover:text-warning-400"
									>
										Undo
									</button>
								</p>
							{/if}
							{#if formErrors?.translation}
								<p class="mt-1 text-xs text-error-500">{getErrorMessage(formErrors.translation)}</p>
							{/if}
							<!-- </div> -->
						</div>
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
							bind:value={correctAnswerText}
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
					<div class="mb-2 flex items-center justify-between">
						<label
							for="alternatives-input"
							class="block text-xs font-semibold tracking-wide text-surface-300 uppercase"
						>
							Alternatives (Optional)
						</label>
						{#if additionalCorrectAnswers.length > 0 || (mode === "edit" && exercise?.additionalCorrectAnswers?.length)}
							<button
								type="button"
								onclick={() => {
									additionalCorrectAnswers = [];
									clearAdditionalAnswers = true;
									toast.push("Alternatives will be removed", {
										theme: {
											"--toastBackground": "var(--color-warning-500)",
											"--toastColor": "white",
											"--toastBarBackground": "var(--color-warning-700)",
										},
									});
								}}
								class="text-xs text-error-500 hover:text-error-400"
								title="Clear all alternatives"
							>
								Clear all
							</button>
						{/if}
					</div>
					<TagsInput
						validate={({ value, inputValue }) => {
							if (value.includes(inputValue)) {
								toast.push("Duplicate additional answer value", {
									theme: {
										"--toastBackground": "var(--color-warning-500)",
										"--toastColor": "white",
										"--toastBarBackground": "var(--color-warning-700)",
									},
								});
								return false;
							}
							return true;
						}}
						onValueChange={({ value }) => {
							const uniqueValues = [...new Set(value)];
							if (uniqueValues.length < value.length) {
								toast.push("Duplicate values removed", {
									theme: {
										"--toastBackground": "var(--color-warning-500)",
										"--toastColor": "white",
										"--toastBarBackground": "var(--color-warning-700)",
									},
								});
							}
							additionalCorrectAnswers = uniqueValues.map((val) => ({
								id: randomId(),
								value: val,
							}));
							// Reset clear flag when user adds new values
							if (value.length > 0) {
								clearAdditionalAnswers = false;
							}
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
								id="alternatives-input"
								placeholder="paris, PARIS, Île de France..."
								class="w-full rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
							/>
						</TagsInput.Control>
						<TagsInput.HiddenInput />
					</TagsInput>
					{#if clearAdditionalAnswers}
						<p class="mt-1 text-xs text-warning-500">
							All alternatives will be removed when you save
							<button
								type="button"
								onclick={() => {
									clearAdditionalAnswers = false;
									additionalCorrectAnswers = (exercise?.additionalCorrectAnswers || []).map(
										(ans) => ({
											id: randomId(),
											value: ans,
										})
									);
								}}
								class="ml-2 underline hover:text-warning-400"
							>
								Undo
							</button>
						</p>
					{:else}
						<p class="mt-1 text-xs text-surface-400">{additionalCorrectAnswers.length} added</p>
					{/if}
				</div>

				<!-- Row 3: Wrong Answers (Always Visible) -->
				<div class="lg:col-span-2">
					<div class="mb-2 flex items-center justify-between">
						<label
							for="distractors-input"
							class="block text-xs font-semibold tracking-wide text-surface-300 uppercase"
						>
							Wrong Answers
						</label>
						{#if distractors.length > 0 || (mode === "edit" && exercise?.distractors?.length)}
							<button
								type="button"
								onclick={() => {
									distractors = [];
									clearDistractors = true;
									toast.push("Distractors will be removed", {
										theme: {
											"--toastBackground": "var(--color-warning-500)",
											"--toastColor": "white",
											"--toastBarBackground": "var(--color-warning-700)",
										},
									});
								}}
								class="text-xs text-error-500 hover:text-error-400"
								title="Clear all distractors"
							>
								Clear all
							</button>
						{/if}
					</div>

					<TagsInput
						validate={({ value, inputValue }) => {
							if (value.includes(inputValue)) {
								toast.push("Duplicate distractor value", {
									theme: {
										"--toastBackground": "var(--color-warning-500)",
										"--toastColor": "white",
										"--toastBarBackground": "var(--color-warning-700)",
									},
								});
								return false;
							}
							return true;
						}}
						onValueChange={({ value }) => {
							// debugger;
							const newValues = [...new Set(value)];
							console.log(newValues);
							distractors = [... new Set(value)].map((val) => ({
								id: randomId(),
								value: val,
							}));

							// Reset clear flag when user adds new values
							if (value.length > 0) {
								clearDistractors = false;
							}
						}}
						value={distractors.map((d) => d.value)}
					>
						<TagsInput.Control class="w-full">
							<TagsInput.Context>
								{#snippet children(tagsInput)}
									<div class="mb-2 flex flex-wrap gap-1">
										{#each tagsInput().value as value, index (index)}
											<TagsInput.Item {value} {index} id={value + index}>
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
								id="distractors-input"
								placeholder="london, berlin, madrid..."
								class="w-full rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
							/>
						</TagsInput.Control>
						<TagsInput.HiddenInput />
					</TagsInput>
					{#if clearDistractors}
						<p class="mt-1 text-xs text-warning-500">
							All distractors will be removed when you save
							<button
								type="button"
								onclick={() => {
									clearDistractors = false;
									distractors = (exercise?.distractors || []).map((ans) => ({
										id: randomId(),
										value: ans,
									}));
								}}
								class="ml-2 underline hover:text-warning-400"
							>
								Undo
							</button>
						</p>
					{:else}
						<p class="mt-1 text-xs text-surface-400">{distractors.length} added</p>
					{/if}
					<!-- <p class="mt-1 text-xs text-surface-400">{distractors.length}/4 added</p> -->
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
					<div class="relative">
						<textarea
							disabled={clearExplanation}
							id="explanation"
							name="explanation"
							bind:value={explanationText}
							placeholder="Why is this the correct answer?"
							rows="3"
							class="w-full resize-none rounded border border-surface-600 bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none"
						></textarea>
						{#if explanationText || (mode === "edit" && exercise?.explanation)}
							<button
								disabled={clearExplanation}
								type="button"
								onclick={() => {
									explanationText = "";
									clearExplanation = true;
									toast.push("Explanation will be removed", {
										theme: {
											"--toastBackground": "var(--color-warning-500)",
											"--toastColor": "white",
											"--toastBarBackground": "var(--color-warning-700)",
										},
									});
								}}
								class="absolute top-2 right-2 rounded p-1 text-surface-400 transition-colors hover:bg-surface-700 hover:text-surface-200 disabled:text-surface-500 disabled:hover:bg-transparent"
								title="Clear explanation (set to null)"
							>
								<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						{/if}
					</div>
					{#if clearExplanation}
						<p class="mt-1 text-xs text-warning-500">
							Explanation will be removed when you save
							<button
								type="button"
								onclick={() => {
									clearExplanation = false;
									explanationText = exercise?.explanation ?? "";
								}}
								class="ml-2 underline hover:text-warning-400"
							>
								Undo
							</button>
						</p>
					{/if}
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
					{:else if questionLength >= questionMinLength && correctAnswerText}
						<span class="font-medium text-success-500">Ready ✓</span>
					{:else}
						<span>Fill required fields</span>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button
						text={submitButtonText}
						type="submit"
						color="primary"
						size="sm"
						disabled={questionLength < questionMinLength}
					/>
					<Button
						text="Cancel"
						type="button"
						color="secondary"
						preset="outlined"
						size="sm"
						onclick={onCancel}
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
