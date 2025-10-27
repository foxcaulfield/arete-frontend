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
		{#if !part.isAnswer}
			<span>{part.text}</span>
		{:else if isAnswered}
			<span class="answer-revealed">{part.text}</span>
		{:else}
			<span class="answer-hidden">{part.text}</span>
		{/if}
	{/each}
</div>
