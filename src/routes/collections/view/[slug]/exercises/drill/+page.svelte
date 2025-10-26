<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let currentQuestion = $derived(props.data.question);
	let error = $derived(props.data?.flags?.errorText ?? null);

	let userAnswer = $state("");
	let lastResult = $state<DrillResult | null>(null);
	let isSubmitting = $state(false);
	let stats = $state({ correct: 0, total: 0 });
	let showResult = $state(false);
	let inputEl = $state<HTMLInputElement | null>(null);
	let imageEl = $state<HTMLImageElement | null>(null);
	let audioEl = $state<HTMLAudioElement | null>(null);
	let resultEl = $state<HTMLElement | null>(null);
	let showImage = $state(false);
	// let nextButtonRef = $state<HTMLButtonElement | null>(null);
	// let inputRef = $state<HTMLInputElement | null>(null);

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
			setTimeout(() => resultEl?.focus?.(), 50);
			// autoplay audio on correct result when possible
			if (lastResult?.isCorrect && currentQuestion?.audioUrl) {
				audioEl?.play?.().catch(() => {});
			}
		}
	});
</script>

<div class="container drill">
	<div class="card-lg">
		<h1>Exercise Drill</h1>
		<!-- stats -->
		<Button text="Exit Drill" onclick={exitDrill} class="btn-exit" />
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
				<!-- {#if currentQuestion.tags && currentQuestion.tags.length > 0}
				<div class="tags">
					{#each currentQuestion.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if} -->

				<div class="question">{currentQuestion.question}</div>

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
									stats.total++;
									if (result.data.isCorrect) stats.correct++;
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
							bind:value={userAnswer}
							bind:this={inputEl}
						/>
						<Button text="Answer" type="submit" disabled={isSubmitting || !userAnswer.trim()} />
						{#if currentQuestion.imageUrl}
							<Button
								type="button"
								variant="secondary"
								text="Show image"
								onclick={() => {
									showImage = !showImage;
									if (showImage) {
										setTimeout(
											() => imageEl?.scrollIntoView({ behavior: "smooth", block: "center" }),
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
				{:else if lastResult}
					<div
						bind:this={resultEl}
						tabindex="-1"
						aria-live="polite"
						class:correct={lastResult.isCorrect}
						class:incorrect={!lastResult.isCorrect}
					>
						<div>{lastResult.isCorrect ? "✅ Correct!" : "❌ Incorrect"}</div>

						<div>
							<p><strong>Your answer:</strong> {userAnswer}</p>
							<p><strong>Correct answer:</strong> {lastResult.correctAnswer}</p>
							{#if lastResult.explanation}
								<p><strong>Explanation:</strong> {lastResult.explanation}</p>
							{/if}
						</div>

						<Button withAction action="?/getNextQuestion" text="Next Question" />

						{#if lastResult.isCorrect && currentQuestion.audioUrl}
							<!-- autoplay audio on correct result (handled in $effect) -->
						{/if}
					</div>
				{/if}
			</div>
		{:else}
			<div>No exercises found in this collection.</div>
		{/if}
	</div>
</div>
