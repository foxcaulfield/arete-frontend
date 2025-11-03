<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto, invalidateAll } from "$app/navigation";
	import Button from "$lib/components/common/Button.svelte";
	import ChoiceSingleExercise from "$lib/components/quiz/ChoiceSingleExercise.svelte";
	import ExerciseImage from "$lib/components/quiz/ExerciseImage.svelte";
	import ExerciseTypeBadge from "$lib/components/quiz/ExerciseTypeBadge.svelte";
	import ExplanationText from "$lib/components/quiz/ExplanationText.svelte";
	import FillInExercise from "$lib/components/quiz/FillInExercise.svelte";
	import TranslationText from "$lib/components/quiz/TranslationText.svelte";
	import type { SubmitFunction } from "@sveltejs/kit";
	import { toast } from "@zerodevx/svelte-toast";
	import { onMount, tick } from "svelte";
	import type { PageProps } from "./$types";

	interface TextPart {
		text: string;
		isAnswer: boolean;
	}

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let currentQuestion = $derived(props.data.question);
	let error = $derived(props.data?.flags?.errorText ?? null);

	let forceTextStorageCookieKey = $derived(`drill.forceTextInput.${collectionId ?? "global"}`);

	let userAnswer = $state("");

	let showResult = $state(false);
	let showImage = $state(false);
	let showExplanation = $state(false);

	let inputElement = $state<HTMLInputElement | undefined>(undefined);
	let imageElement = $state<HTMLImageElement | undefined>(undefined);
	let audioElement = $state<HTMLAudioElement | undefined>(undefined);
	let nextButtonElement = $state<HTMLButtonElement | undefined>(undefined);
	let explanationElement = $state<HTMLElement | undefined>(undefined);

	let lastResult = $state<Quiz.UserAnswerFeedbackDto | null>(null);
	let lastUserAnswer = $state("");

	// Track the force text input preference as mutable state
	let isForceTextInput = $state(false);

	// Sync with server-provided prop when available
	// $effect(() => {
	// 	if (typeof props.data?.forceTextInput === "boolean") {
	// 		isForceTextInput = props.data.forceTextInput;
	// 	}
	// });

	// Parse question text into parts (text + hidden answers)
	const questionParts = $derived.by(() => {
		if (!currentQuestion?.question) return [];
		const result: TextPart[] = [];
		const regEx = /{{(.*?)}}|([^{}]+)/g;
		let match: RegExpExecArray | null;

		while ((match = regEx.exec(currentQuestion.question)) !== null) {
			if (match[1]) {
				result.push({ text: match[1].trim(), isAnswer: true });
			} else if (match[2]) {
				result.push({ text: match[2].trim(), isAnswer: false });
			}
		}
		return result;
	});

	async function handleForceTextInput() {
		isForceTextInput = !isForceTextInput;

		// Set a cookie so the server can render the correct UI on
		// subsequent navigations/partial updates. Keep it for 1 week.
		// try {
		// 	const key = forceTextStorageCookieKey;
		// 	const maxAge = 60 * 60 * 24 * 7; // 1 week
		// 	document.cookie = `${encodeURIComponent(key)}=${isForceTextInput ? "true" : "false"}; path=/; max-age=${maxAge}; SameSite=Lax`;
		// } catch (e) {
		// 	// ignore cookie set errors
		// }

		if (isForceTextInput) {
			await tick();
			inputElement?.focus?.();
		}
	}

	async function exitDrill() {
		await goto(`/collections/view/${collectionId}`);
	}

	const handleFormEnhance: SubmitFunction = () => {
		// isSubmitting = true;
		return async ({ result, formData }) => {
			// isSubmitting = false;
			if (result.type === "success" && result.data) {
				lastResult = result.data as unknown as Quiz.UserAnswerFeedbackDto;
				lastUserAnswer = formData.get("userAnswer")?.toString() || "";
				showResult = true;

				if (lastResult?.isCorrect && currentQuestion?.audioUrl) {
					await audioElement?.play?.().catch(() => {});
				}
			} else if (result.type === "failure") {
				error = String(result.data?.message) || "Error submitting answer";
			}

			await tick();
			nextButtonElement?.focus();
			// setTimeout(() => nextButtonEl?.focus(), 0);
		};
	};

	const scrollOptions = { behavior: "smooth", block: "center" } as const;

	async function handleShowImage() {
		showImage = !showImage;
		if (showImage) {
			await tick();
			imageElement?.scrollIntoView(scrollOptions);
		}
	}

	async function handleShowExplanation() {
		showExplanation = !showExplanation;
		if (showExplanation) {
			await tick();
			explanationElement?.scrollIntoView(scrollOptions);
		}
	}

	async function handlePlayAudio() {
		if (audioElement) {
			await audioElement.play().catch(() => {});
		}
	}
	const handleGetNextQuestionEnhance: SubmitFunction = () => {
		console.log("Refreshing question");
		showExplanation = false;
		showImage = false;

		return async ({ update }) => {
			await invalidateAll();
			showResult = false;
			userAnswer = "";
			// await update();
			if (currentQuestion && (currentQuestion.type === "FILL_IN_THE_BLANK" || isForceTextInput)) {
				await tick();
				inputElement?.focus?.({ preventScroll: true });
			}
		};
	};

	onMount(() => {
		// Focus the input element on mount if applicable
		if (currentQuestion && (currentQuestion.type === "FILL_IN_THE_BLANK" || isForceTextInput)) {
			inputElement?.focus?.({ preventScroll: true });
		}
	});
</script>

<div class="w-full p-4 md:p-6">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6 flex items-center justify-between gap-4">
			<Button text="Exit" onclick={exitDrill} color="secondary" preset="outlined" size="sm" />
			{#if currentQuestion?.type}
				<ExerciseTypeBadge exerciseType={currentQuestion.type} />
			{/if}
		</div>

		<!-- Error Alert -->
		{#if error}
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
				<div>{error}</div>
			</div>
		{/if}

		{#if currentQuestion}
			<div class="space-y-4">
				{#if currentQuestion.audioUrl}
					<audio
						bind:this={audioElement}
						src={"/api/files?type=audio&name=" + currentQuestion.audioUrl}
						preload="auto"
						hidden
					></audio>
				{/if}

				<!-- Question Card -->
				<div class="rounded-lg border border-surface-700 bg-surface-900 p-4 md:p-6">
					<!-- Question Header with Controls -->
					<div
						class="mb-6 flex flex-col gap-4 border-b border-surface-700 pb-4 md:flex-row md:items-start md:justify-between"
					>
						<div class="min-w-0 flex-1">
							<!-- Question Text with Hidden Answers -->
							<div class="text-xl leading-relaxed font-semibold text-surface-100 md:text-2xl">
								{#each questionParts as part, i (i)}
									{@const shouldReveal = part.isAnswer && showResult}
									{@const shouldHide = part.isAnswer && !showResult}
									<span
										class="rounded px-1"
										class:text-success-400={shouldReveal}
										class:bg-primary-500={shouldHide}
										class:text-primary-500={shouldHide}
									>
										{part.text}
									</span>
									{#if i < questionParts.length - 1 && !questionParts[i + 1].isAnswer && !part.isAnswer}
										<span> </span>
									{/if}
								{/each}
							</div>
						</div>
						<div class="flex flex-shrink-0 gap-1">
							<button
								type="button"
								class="rounded px-2 py-1 text-xs text-primary-500 transition-colors hover:bg-surface-800 hover:text-primary-400"
								onclick={() => {
									navigator.clipboard.writeText(
										currentQuestion.question.replace(/{/g, "").replace(/}/g, "")
									);
									toast.push("Copied!", {
										theme: {
											"--toastBackground": "var(--color-success-500)",
											"--toastColor": "white",
											"--toastBarBackground": "var(--color-success-700)",
										},
									});
								}}
								title="Copy question"
							>
								Copy
							</button>
							<button
								type="button"
								class="rounded px-2 py-1 text-xs text-primary-500 transition-colors hover:bg-surface-800 hover:text-primary-400"
								onclick={() =>
									goto(`/collections/view/${collectionId}/exercises/edit/${currentQuestion.id}`)}
								title="Edit exercise"
							>
								Edit
							</button>
							<button
								type="button"
								class="rounded px-2 py-1 text-xs text-primary-500 transition-colors hover:bg-surface-800 hover:text-primary-400"
								onclick={handleForceTextInput}
								title={isForceTextInput ? "Switch to choice" : "Switch to text"}
							>
								{isForceTextInput ? "Switch to choice" : "Switch to text "}
							</button>

							<form method="POST" action="?/getNextQuestion" use:enhance={handleGetNextQuestionEnhance}>
								<Button
									type="submit"
									bind:buttonElement={nextButtonElement}
									color="surface"
									preset="outlined"
									size="sm"
									text={`⟳`}
								/>
							</form>
						</div>
					</div>

					<!-- Translation (if available) -->
					{#if currentQuestion.translation}
						<div class="mb-4">
							<TranslationText translationText={currentQuestion.translation} />
						</div>
					{/if}

					<!-- Answer Input/Selection -->
					<form action="?/handleSubmitAnswer" method="POST" use:enhance={handleFormEnhance} class="mb-4">
						<input type="hidden" name="exerciseId" value={currentQuestion.id} />
						{#if currentQuestion.type === "FILL_IN_THE_BLANK" || isForceTextInput}
							<FillInExercise {showResult} bind:userAnswer bind:inputElement />
						{:else if currentQuestion.type === "CHOICE_SINGLE"}
							<ChoiceSingleExercise
								distractors={currentQuestion.distractors || []}
								{lastResult}
								{lastUserAnswer}
								{showResult}
							/>
						{/if}
					</form>

					<!-- Result Feedback -->
					{#if showResult && lastResult}
						<div class="mb-4 border-t border-surface-700 pt-4">
							{#if lastResult.isCorrect}
								<div
									class="rounded border border-success-700 bg-success-900 p-3 text-xs text-success-400"
								>
									<span class="font-semibold">✓ Correct!</span>
									<!-- {#if lastResult?.feedback}
										<p class="mt-1">{lastResult.feedback}</p>
									{/if} -->
								</div>
							{:else}
								<div class="rounded border border-error-700 bg-error-900 p-3 text-xs text-error-400">
									<span class="font-semibold">✗ Not quite right</span>
									<!-- {#if lastResult.feedback}
										<p class="mt-1">{lastResult.feedback}</p>
									{/if} -->
									{#if lastResult.correctAnswer}
										<p class="mt-2 text-success-400">
											Correct: <span class="font-semibold">{lastResult.correctAnswer}</span>
										</p>
									{/if}
								</div>
							{/if}
						</div>
					{/if}

					<!-- Action Buttons -->
					<div class="flex flex-wrap gap-2 border-t border-surface-700 pt-4">
						{#if showResult}
							<form
								method="POST"
								action="?/getNextQuestion"
								use:enhance={handleGetNextQuestionEnhance}
								class="inline"
							>
								<Button
									type="submit"
									bind:buttonElement={nextButtonElement}
									color="primary"
									size="sm"
									text="Next"
								/>
							</form>
						{/if}
						{#if currentQuestion.imageUrl}
							<button
								type="button"
								class="rounded border border-surface-600 px-3 py-2 text-xs text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-200"
								onclick={handleShowImage}
							>
								{showImage ? "Hide Image" : "Image"}
							</button>
						{/if}
						{#if currentQuestion.audioUrl}
							<button
								type="button"
								class="rounded border border-surface-600 px-3 py-2 text-xs text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-200"
								onclick={handlePlayAudio}
							>
								Audio
							</button>
						{/if}
						{#if currentQuestion.explanation}
							<button
								type="button"
								class="rounded border border-surface-600 px-3 py-2 text-xs text-surface-300 transition-colors hover:bg-surface-800 hover:text-surface-200"
								onclick={handleShowExplanation}
							>
								{showExplanation ? "Hide Explanation" : "Explanation"}
							</button>
						{/if}
					</div>
				</div>

				<!-- Image (if shown) -->
				{#if showImage && currentQuestion.imageUrl}
					<div class="rounded-lg border border-surface-700 bg-surface-900 p-4 md:p-6">
						<ExerciseImage bind:imageElement imageUrl={currentQuestion.imageUrl} />
					</div>
				{/if}

				<!-- Explanation (if shown) -->
				{#if showExplanation && currentQuestion.explanation}
					<div class="rounded-lg border border-surface-700 bg-surface-900 p-4 md:p-6">
						<ExplanationText bind:explanationEl={explanationElement} text={currentQuestion.explanation} />
					</div>
				{/if}
			</div>
		{:else}
			<div
				class="rounded-lg border border-surface-700 bg-surface-900 p-4 text-center text-sm text-surface-400 md:p-6"
			>
				No exercises found in this collection.
			</div>
		{/if}
	</div>
</div>
