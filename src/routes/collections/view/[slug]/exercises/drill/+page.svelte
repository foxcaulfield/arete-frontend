<script lang="ts">
	import { enhance } from "$app/forms";
	import { goto } from "$app/navigation";
	import type { PageProps } from "./$types";

	const props: PageProps = $props();
	const collectionId = props.data.collectionId;

	let currentQuestion = $state<CurrentQuestion | null>(props.data.question);
	let userAnswer = $state("");
	let lastResult = $state<DrillResult | null>(null);
	let isSubmitting = $state(false);
	let error = $state<string | null>(props.data?.flags?.errorText ?? null);
	let stats = $state({ correct: 0, total: 0 });
	let showResult = $state(false);
	let nextButtonRef = $state<HTMLButtonElement | null>(null);

	async function exitDrill() {
		await goto(`/collections/view/${collectionId}`);
	}
</script>

<div class="drill-container">
	<div class="drill-header">
		<h1>Exercise Drill</h1>
		<button onclick={exitDrill} class="btn-exit">Exit Drill</button>
	</div>

	{#if error}
		<div class="alert alert-error">{error}</div>
	{/if}

	{#if currentQuestion}
		<div class="question-card">
			{#if currentQuestion.tags && currentQuestion.tags.length > 0}
				<div class="tags">
					{#each currentQuestion.tags as tag}
						<span class="tag">{tag}</span>
					{/each}
				</div>
			{/if}

			<div class="question">
				<p>{currentQuestion.question}</p>
				<div class="placeholder-hint">{currentQuestion.placeholderSequence}</div>
			</div>

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
								setTimeout(() => nextButtonRef?.focus(), 0);
							} else if (result.type === "failure") {
								error = String(result.data?.message) || "Error submitting answer";
							}
						};
					}}
				>
					<div class="answer-form">
						<input type="hidden" name="exerciseId" value={currentQuestion.id} />
						<input
							type="text"
							name="userAnswer"
							bind:value={userAnswer}
							placeholder="Enter your answer"
							onkeydown={(e) => e.key === "Enter" && e.currentTarget.form?.requestSubmit()}
						/>
						<!-- onkeydown={(e) => e.key === "Enter" && handleSubmitAnswer()} -->
						<!-- disabled={isSubmitting} -->
						<div>
							<button
								type="submit"
								formaction="?/handleSubmitAnswer"
								disabled={isSubmitting || !userAnswer.trim()}>Submit</button
							>
						</div>
					</div>
				</form>
			{:else if lastResult}
				<div class="result" class:correct={lastResult.isCorrect} class:incorrect={!lastResult.isCorrect}>
					<div class="result-status">
						{lastResult.isCorrect ? "✓ Correct!" : "✗ Incorrect"}
					</div>

					<div class="result-details">
						<p><strong>Your answer:</strong> {userAnswer}</p>
						<p><strong>Correct answer:</strong> {lastResult.correctAnswer}</p>
						{#if lastResult.explanation}
							<p><strong>Explanation:</strong> {lastResult.explanation}</p>
						{/if}
					</div>

					<form action="?/getNextQuestion" method="POST" >
						<button bind:this={nextButtonRef} formaction="?/getNextQuestion" class="btn-next">
							Next Question
						</button>
					</form>
				</div>
			{/if}
		</div>
	{:else}
		<div class="message">No exercises found in this collection.</div>
	{/if}
</div>

<style>
	.drill-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem 1.5rem;
		min-height: 100vh;
	}

	.drill-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2.5rem;
		gap: 1.5rem;
		flex-wrap: wrap;
	}

	.stats {
		display: flex;
		gap: 1rem;
		align-items: center;
		font-weight: 600;
		background: rgba(30, 41, 59, 0.8);
		padding: 0.75rem 1.5rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--color-border-primary);
		color: var(--color-text-secondary);
	}

	.accuracy {
		background: var(--gradient-primary);
		color: var(--color-accent-dark);
		padding: 0.5rem 1.25rem;
		border-radius: 20px;
		font-size: 0.95rem;
		font-weight: 700;
		box-shadow: var(--shadow-accent);
	}

	.tags-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-bottom: 1.5rem;
	}

	.question-section {
		margin-bottom: 2.5rem;
	}

	.question-text {
		font-size: 1.3rem;
		margin: 0 0 1rem 0;
		font-weight: 600;
		color: #f1f5f9;
		line-height: 1.6;
	}

	.placeholder-hint {
		background: rgba(15, 23, 42, 0.8);
		padding: 1rem;
		border-radius: var(--radius-md);
		font-size: 0.95rem;
		color: var(--color-text-tertiary);
		font-family: "Courier New", monospace;
		border-left: 4px solid var(--color-accent-primary);
		line-height: 1.6;
		border: 1px solid var(--color-border-primary);
	}

	.answer-form {
		display: flex;
		gap: 0.75rem;
		align-items: stretch;
	}

	.result {
		padding: 2rem;
		border-radius: var(--radius-lg);
		margin-top: 2rem;
		border-left: 6px solid;
		animation: slideUp var(--transition-normal);
		backdrop-filter: blur(10px);
	}

	.result.correct {
		background: var(--color-success-bg);
		border-color: var(--color-success);
		color: var(--color-success-light);
	}

	.result.incorrect {
		background: var(--color-error-bg);
		border-color: var(--color-error);
		color: var(--color-error-light);
	}

	.result-status {
		font-size: 1.4rem;
		font-weight: 700;
		margin-bottom: 1.5rem;
	}

	.result-details {
		margin: 0;
	}

	.result-details p {
		margin: 0.75rem 0;
		font-size: 1rem;
		line-height: 1.6;
		color: var(--color-text-primary);
	}

	.message {
		text-align: center;
		padding: 3rem 2rem;
		color: var(--color-text-tertiary);
		font-size: 1.1rem;
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.drill-container {
			padding: 1rem;
		}

		.drill-header {
			flex-direction: column;
			align-items: stretch;
		}

		.stats {
			justify-content: space-around;
		}

		.answer-form {
			flex-direction: column;
		}
	}
</style>
