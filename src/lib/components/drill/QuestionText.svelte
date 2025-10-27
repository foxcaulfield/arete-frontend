<script lang="ts">
	interface TextPart {
		text: string;
		isAnswer: boolean;
	}

	interface Props {
		questionText: string;
		isAnswered: boolean;
	}

	let { questionText, isAnswered }: Props = $props();

	const parts = $derived.by(() => {
		const result: TextPart[] = [];
		const regEx = /{{(.*?)}}|([^{}]+)/g;
		let match: RegExpExecArray | null;

		while ((match = regEx.exec(questionText)) !== null) {
			if (match[1]) {
				result.push({ text: match[1].trim(), isAnswer: true });
			} else if (match[2]) {
				result.push({ text: match[2].trim(), isAnswer: false });
			}
		}
		return result;
	});
</script>

<div class="question-text">
	{#each parts as part, i (i)}
		{@const shouldReveal = part.isAnswer && isAnswered}
		{@const shouldHide = part.isAnswer && !isAnswered}
		<span class:answer={true} class:answer-revealed={shouldReveal} class:answer-hidden={shouldHide}
			>{part.text}</span
		>
	{/each}
</div>

<style>
	.question-text {
		font-size: 1.75rem;
		font-weight: 600;
		margin: 0.5rem 0 0.6rem;
		color: var(--text);
	}

	.answer {
		border-radius: var(--radius-sm);
		padding: 0.1em 0em;
		margin: 0 0.15em;
	}

	.answer-revealed {
		color: var(--success);
	}

	.answer-hidden {
		background-color: var(--accent);
		color: var(--accent);
	}
</style>
