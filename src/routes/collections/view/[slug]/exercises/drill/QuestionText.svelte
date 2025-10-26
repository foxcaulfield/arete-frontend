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

	let parts: TextPart[] = $state([]);

	function prepare(raw: string): TextPart[] {
		const result: TextPart[] = [];
		const regEx = /{{(.*?)}}|([^{}]+)/g;
		let match: RegExpExecArray | null;

		while ((match = regEx.exec(raw)) !== null) {
			if (match[1]) {
				result.push({ text: match[1].trim(), isAnswer: true });
			} else if (match[2]) {
				result.push({ text: match[2].trim(), isAnswer: false });
			}
		}
		// console.log("Parsed parts:", result);
		return result;
	}

	$effect(() => {
		// console.log("questionText:", questionText, "isAnswered:", isAnswered);
		parts = prepare(questionText);
	});
</script>

{#each parts as part, i (i)}
	{#if !part.isAnswer}
		<span>{part.text}</span>
	{:else if isAnswered}
		<span class="answer-revealed">{part.text}</span>
	{:else}
		<span class="answer-hidden">{part.text}</span>
	{/if}
{/each}

<style>
	.answer-revealed {
		color: var(--success);
		border-radius: var(--radius-sm);
		padding: 0.1em 0.3em;
		margin: 0 0.15em;
	}

	.answer-hidden {
		background-color: var(--accent);
		color: var(--accent);
		border-radius: var(--radius-sm);
		padding: 0.1em 0.3em;
		margin: 0 0.15em;
	}
</style>
