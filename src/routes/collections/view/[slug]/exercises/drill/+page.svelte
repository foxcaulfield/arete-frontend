<script lang="ts">
	//  import type { SubmitFunction } from '$app/forms';
	import { tick, onMount } from "svelte";
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import type { SubmitFunction } from "@sveltejs/kit";
	import type { PageProps } from "./$types";
	import QuestionText from "$lib/components/drill/QuestionText.svelte";
	// import FormGroupTextInput from "$lib/components/FormGroupTextInput.svelte";
	import TranslationText from "$lib/components/drill/TranslationText.svelte";
	import ExplanationText from "$lib/components/drill/ExplanationText.svelte";
	import ExerciseImage from "$lib/components/drill/ExerciseImage.svelte";
	import ExerciseTypeBadge from "$lib/components/drill/ExerciseTypeBadge.svelte";
	import FillInExercise from "$lib/components/drill/FillInExercise.svelte";
	import ChoiceSingleExercise from "$lib/components/drill/ChoiceSingleExercise.svelte";

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
	let audioElement = $state<HTMLAudioElement | null>(null);
	let nextButtonEl = $state<HTMLButtonElement | undefined>(undefined);
	let explanationEl = $state<HTMLElement | undefined>(undefined);

	let lastResult = $state<DrillResult | null>(null);
	let lastUserAnswer = $state("");

	// Initialize from server-provided prop when available so initial renders
	let isForceTextInput = $derived.by(() =>
		typeof props.data?.forceTextInput === "boolean" ? props.data?.forceTextInput : true
	);

	function handleForceTextInput() {
		isForceTextInput = !isForceTextInput;

		// Set a cookie so the server can render the correct UI on
		// subsequent navigations/partial updates. Keep it for 1 week.
		try {
			const key = forceTextStorageCookieKey;
			const maxAge = 60 * 60 * 24 * 7; // 1 week
			document.cookie = `${encodeURIComponent(key)}=${isForceTextInput ? "true" : "false"}; path=/; max-age=${maxAge}; SameSite=Lax`;
		} catch (e) {
			// ignore cookie set errors
		}

		if (isForceTextInput) {
			tick().then(() => {
				inputElement?.focus?.();
			});
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
				lastResult = result.data as unknown as DrillResult;
				lastUserAnswer = formData.get("userAnswer")?.toString() || "";
				// stats.total++;
				// if (result.data.isCorrect) stats.correct++;
				showResult = true;
				// Focus the Next Question button after showing result
				// setTimeout(() => nextButtonRef?.focus(), 0);
			} else if (result.type === "failure") {
				error = String(result.data?.message) || "Error submitting answer";
			}
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
			explanationEl?.scrollIntoView(scrollOptions);
		}
	}

	async function handlePlayAudio() {
		if (audioElement) {
			await audioElement.play().catch(() => {});
		}
	}

	$effect(() => {
		if (currentQuestion && !showResult && (currentQuestion.type === "FILL_IN_THE_BLANK" || isForceTextInput)) {
			// focus the input for fast typing
			tick().then(() => inputElement?.focus?.());
		}
	});

	$effect(() => {
		if (showResult) {
			tick().then(() => nextButtonEl?.focus?.());
			// autoplay audio on correct result when possible
			if (lastResult?.isCorrect && currentQuestion?.audioUrl) {
				audioElement?.play?.().catch(() => {});
			}
		}
	});
</script>

<div class="container drill">
	<div class="header-row">
		<div class="card-lg">
			<Button text="Exit Drill" onclick={exitDrill} variant="secondary" appearance="ghost" />
		</div>
		{#if currentQuestion?.type}
			<ExerciseTypeBadge exerciseType={currentQuestion.type} />
		{/if}
	</div>

	<div
		class="card form-card compact-form with-border"
		class:failed={showResult && lastResult && !lastResult.isCorrect}
		class:success={showResult && lastResult && lastResult.isCorrect}
	>
		{#if error}
			<div class="field-error">{error}</div>
		{/if}

		{#if currentQuestion}
			<div class="question-container">
				{#if currentQuestion.audioUrl}
					<!-- keep audio element mounted even when we show result so we can autoplay on success -->
					<audio
						bind:this={audioElement}
						src={"/api/files?type=audio&name=" + currentQuestion.audioUrl}
						preload="auto"
						hidden
					></audio>
				{/if}

				<!-- Buttons row at top right -->
				<div class="button-controls">
					<!-- refresh question button -->
					<Button
						bind:buttonElement={nextButtonEl}
						withAction
						action="?/getNextQuestion"
						variant="secondary"
						appearance="ghost"
						size="sm"
						text={`⟳`}
					/>
					<!-- force text input button -->
					<Button
						type="button"
						variant="secondary"
						appearance="ghost"
						size="sm"
						text="Force Text Input"
						onclick={handleForceTextInput}
					/>
				</div>

				<QuestionText questionText={currentQuestion.question} isAnswered={showResult} />

				{#if currentQuestion.translation}
					<TranslationText translationText={currentQuestion.translation} />
				{/if}

				<!-- {#if !showResult} -->
				<form action="?/handleSubmitAnswer" method="POST" use:enhance={handleFormEnhance}>
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
				<div class="media-row">
					{#if showResult}
						<Button
							bind:buttonElement={nextButtonEl}
							withAction
							action="?/getNextQuestion"
							variant="secondary"
							appearance="outline"
							size="sm"
							text="Next Question"
						/>
					{/if}
					{#if currentQuestion.imageUrl}
						<Button
							type="button"
							variant="secondary"
							appearance="ghost"
							size="sm"
							text="Show image"
							onclick={handleShowImage}
						/>
					{/if}
					{#if currentQuestion.audioUrl}
						<Button
							type="button"
							variant="secondary"
							appearance="ghost"
							size="sm"
							text="Play audio"
							onclick={handlePlayAudio}
						/>
					{/if}
					{#if currentQuestion.explanation}
						<Button
							type="button"
							variant="secondary"
							appearance="ghost"
							size="sm"
							text="Show explanation"
							onclick={handleShowExplanation}
						/>
					{/if}
				</div>
				{#if showImage && currentQuestion.imageUrl}
					<ExerciseImage bind:imageElement imageUrl={currentQuestion.imageUrl} />
				{/if}
				{#if showExplanation && currentQuestion.explanation}
					<ExplanationText bind:explanationEl text={currentQuestion.explanation} />
				{/if}
			</div>
		{:else}
			<div>No exercises found in this collection.</div>
		{/if}
	</div>
</div>

<style>
	.drill .header-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: space-between;
		gap: 0.6rem;
	}

	.with-border {
		border: var(--default-border);
	}

	.failed {
		background-color: rgba(239, 68, 68, 0.1);
		border-color: #ef4444;
	}

	.success {
		background-color: rgba(34, 197, 94, 0.05);
		border-color: #22c55e;
	}

	.drill .form-card {
		max-width: 760px;
	}

	.question-container {
		position: relative;
	}

	.button-controls {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}

	.media-row {
		margin-top: 0.6rem;
		display: flex;
		gap: 0.6rem;
		align-items: center;
		justify-content: center;
		margin-top: 0.5rem;
		gap: 0.5rem;
		margin-left: auto;
	}

	.hidden {
		display: none !important;
	}
</style>
