<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import Button from "$lib/components/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let currentQuestion = $derived<CurrentQuestion | null>(props.data.question);
	let error = $derived<string | null>(props.data?.flags?.errorText ?? null);

	let userAnswer = $state("");
	let lastResult = $state<DrillResult | null>(null);
	let isSubmitting = $state(false);
	let stats = $state({ correct: 0, total: 0 });
	let showResult = $state(false);
	// let nextButtonRef = $state<HTMLButtonElement | null>(null);
	// let inputRef = $state<HTMLInputElement | null>(null);

	async function exitDrill() {
		await goto(`/collections/view/${collectionId}`);
	}

	$effect(() => {
		if (currentQuestion && !showResult) {
			// inputRef?.focus();
		}
	});
</script>

<div>
	<div>
		<h1>Exercise Drill</h1>
		<!-- stats -->
		<Button text="Exit Drill" onclick={exitDrill} class="btn-exit" />
	</div>

	{#if error}
		<div>{error}</div>
	{/if}

	{#if currentQuestion}
		<div>
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
					<TextInput type="hidden" name="exerciseId" value={currentQuestion.id} />
					<TextInput name="userAnswer" placeholder="Enter your answer" bind:value={userAnswer} />
					<Button text="Answer" type="submit" disabled={isSubmitting || !userAnswer.trim()} />
				</form>
			{:else if lastResult}
				<div class:correct={lastResult.isCorrect} class:incorrect={!lastResult.isCorrect}>
					<div>{lastResult.isCorrect ? "✅ Correct!" : "❌ Incorrect"}</div>

					<div>
						<p><strong>Your answer:</strong> {userAnswer}</p>
						<p><strong>Correct answer:</strong> {lastResult.correctAnswer}</p>
						{#if lastResult.explanation}
							<p><strong>Explanation:</strong> {lastResult.explanation}</p>
						{/if}
					</div>

					<!-- bind:this={nextButtonRef} -->
					<Button withAction action="?/getNextQuestion" text="Next Question" />
				</div>
			{/if}
		</div>
	{:else}
		<div>No exercises found in this collection.</div>
	{/if}
</div>
