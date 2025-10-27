<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import { getTypeDesc, getTypeIcon, getTypeLabel } from "$lib/utils/exercise-type.utils";
	import type { SvelteComponent } from "svelte";
	import type { PageProps } from "./$types";
	import QuestionText from "./QuestionText.svelte";

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let currentQuestion = $derived(props.data.question);
	let error = $derived(props.data?.flags?.errorText ?? null);

	let userAnswer = $state("");
	let lastResult = $state<DrillResult | null>(null);
	let isSubmitting = $state(false);
	let showResult = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);
	let imageEl = $state<HTMLImageElement | null>(null);
	let audioEl = $state<HTMLAudioElement | null>(null);
	let nextButtonEl = $state<HTMLButtonElement | undefined>(undefined);
	let explanationEl = $state<HTMLElement | null>(null);

	let showImage = $state(false);
	let showExplanation = $state(false);

	async function exitDrill() {
		await goto(`/collections/view/${collectionId}`);
	}

	$effect(() => {
		if (currentQuestion && !showResult) {
			// focus the input for fast typing
			setTimeout(() => inputEl?.focus?.(), 0);
		}
	});

	$effect(() => {
		if (showResult) {
			// focus result area for keyboard users and screen readers
			setTimeout(() => nextButtonEl?.focus?.(), 50);
			// autoplay audio on correct result when possible
			if (lastResult?.isCorrect && currentQuestion?.audioUrl) {
				audioEl?.play?.().catch(() => {});
			}
		}
	});
</script>

<div class="container drill">
	<div class="header-row">
		<div class="card-lg">
			<h1>Exercise Drill</h1>
			<!-- stats -->
			<Button text="Exit Drill" onclick={exitDrill} class="btn-exit" />
		</div>
		{#if currentQuestion?.type}
			<div class="question-type-row">
				<span class="type-badge" title={getTypeLabel(currentQuestion.type)}>
					{@html getTypeIcon(currentQuestion.type)}
				</span>
				<div class="type-info">
					<div class="type-name">{getTypeLabel(currentQuestion.type)}</div>
					<div class="type-desc">{getTypeDesc(currentQuestion.type)}</div>
				</div>
			</div>
		{/if}
	</div>

	<div class="card form-card compact-form" style="margin-top:1rem">
		{#if error}
			<div class="field-error">{error}</div>
		{/if}

		{#if currentQuestion}
			<div>
				{#if currentQuestion.audioUrl}
					<!-- keep audio element mounted even when we show result so we can autoplay on success -->
					<audio
						bind:this={audioEl}
						src={"/api/files?type=audio&name=" + currentQuestion.audioUrl}
						preload="auto"
						hidden
					></audio>
				{/if}

				<QuestionText questionText={currentQuestion.question} isAnswered={showResult} />

				{#if currentQuestion.translation}
					<TranslationText translationText={currentQuestion.translation} />
				{/if}

				{#if !showResult}
					<form
						action="?/handleSubmitAnswer"
						method="POST"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ result }) => {
								isSubmitting = false;
								if (result.type === "success" && result.data) {
									lastResult = result.data as unknown as DrillResult;
									// stats.total++;
									// if (result.data.isCorrect) stats.correct++;
									showResult = true;
									// Focus the Next Question button after showing result
									// setTimeout(() => nextButtonRef?.focus(), 0);
								} else if (result.type === "failure") {
									error = String(result.data?.message) || "Error submitting answer";
								}
							};
						}}
					>
						<!-- onkeydown={(e) => e.key === "Enter" && e.currentTarget.form?.requestSubmit()} -->
						<input type="hidden" name="exerciseId" value={currentQuestion.id} />
						<input
							class="text-input"
							name="userAnswer"
							id="userAnswer"
							placeholder="Enter your answer"
							autocomplete="off"
							bind:value={userAnswer}
							bind:this={inputEl}
						/>
						<div class="button-row" style="margin-top:0.5rem">
							<Button text="Answer" type="submit" disabled={isSubmitting || !userAnswer.trim()} />
							<div class="media-row" style="margin-top:0.5rem;gap:0.5rem">
								{#if currentQuestion.imageUrl}
									<Button
										type="button"
										variant="secondary"
										text="Show image"
										onclick={() => {
											showImage = !showImage;
											if (showImage) {
												setTimeout(
													() =>
														imageEl?.scrollIntoView({
															behavior: "smooth",
															block: "center",
														}),
													60
												);
											}
										}}
									/>
								{/if}
								{#if currentQuestion.audioUrl}
									<Button
										type="button"
										variant="secondary"
										text="Play audio"
										onclick={() => {
											audioEl?.play().catch(() => {});
										}}
									/>
								{/if}
								{#if currentQuestion.explanation}
									<Button
										type="button"
										variant="secondary"
										text="Show explanation"
										onclick={() => {
											// alert(currentQuestion.explanation);
											showExplanation = !showExplanation;
											if (showExplanation) {
												setTimeout(
													() =>
														explanationEl?.scrollIntoView({
															behavior: "smooth",
															block: "center",
														}),
													60
												);
											}
										}}
									/>
								{/if}
							</div>
						</div>
					</form>

					{#if showImage}
						<div class="media-card">
							<img
								bind:this={imageEl}
								src={"/api/files?type=image&name=" + currentQuestion.imageUrl}
								alt="Visual representation of the question"
								style="max-width:100%;border-radius:6px"
							/>
						</div>
					{/if}
					{#if showExplanation}
						<div class="explanation-card" bind:this={explanationEl} tabindex="-1" aria-live="polite">
							<p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
						</div>
					{/if}
				{:else if lastResult}
					<div
						tabindex="-1"
						aria-live="polite"
						class:correct={lastResult.isCorrect}
						class:incorrect={!lastResult.isCorrect}
					>
						<div class="result-message">{lastResult.isCorrect ? "✅ Correct!" : "❌ Incorrect"}</div>

						<Button bind:buttonElement={nextButtonEl} withAction action="?/getNextQuestion" text="Next Question" />
					</div>
				{/if}
			</div>
		{:else}
			<div>No exercises found in this collection.</div>
		{/if}
	</div>
</div>

<style>
	.question-type-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0.4rem 0;
	}
	.type-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		/* background: var(--card-bg, #f5f7fa); */
		color: var(--muted, #334155);
		flex: 0 0 40px;
	}
	.type-info {
		display: flex;
		flex-direction: column;
	}
	.type-name {
		font-weight: 600;
		font-size: 0.95rem;
	}
	.type-desc {
		font-size: 0.82rem;
		color: var(--muted, #667085);
	}
	.drill .header-row {
		display: flex;
		flex-direction: row;
		align-items: stretch;
		justify-content: space-between;
		gap: 0.6rem;
	}

	/* .drill .btn-exit {
		margin-left: auto;
	} */

	.translation {
		margin: 0.5rem 0 1rem 0;
		font-size: 0.9rem;
		color: var(--muted, #667085);
	}

	.explanation-card {
		margin-top: 1rem;
		padding: 1rem;
		background-color: var(--card-bg);
		border: 1px solid var(--border);
		border-radius: 8px;
	}

	.button-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.result-message {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 0.75rem;
	}
</style>
