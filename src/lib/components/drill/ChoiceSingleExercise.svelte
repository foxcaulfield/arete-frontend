<script lang="ts">
	import Button from "../Button.svelte";

	interface Props {
		distractors: string[];
		showResult: boolean;
		lastResult: Quiz.UserAnswerFeedbackDto | null;
		lastUserAnswer: string;
	}
	const { distractors, showResult, lastResult, lastUserAnswer }: Props = $props();
	let choiceButtons = $state<HTMLButtonElement[]>([]);

	const KEYBOARD_MAP: Record<string, number> = {
		"5": 0,
		"6": 1,
		"2": 2,
		"3": 3,
		"q": 0,
		"w": 1,
		"a": 2,
		"s": 3,
	};

	function handleKeyDown(e: KeyboardEvent) {
		if (showResult) {
			return;
		}

		const buttonIndex = KEYBOARD_MAP[e.key.toLowerCase()];

		if (buttonIndex !== undefined && choiceButtons[buttonIndex]) {
			// e.preventDefault();
			choiceButtons[buttonIndex]?.click();
		}
	}
</script>

<svelte:window on:keydown={handleKeyDown} />

<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
	{#each distractors as distractor, index (index)}
		<Button
			bind:buttonElement={choiceButtons[index]}
			disabled={showResult}
			type="submit"
			variant={showResult
				? lastResult?.isCorrect
					? distractor === lastResult?.correctAnswer
						? "success"
						: "secondary"
					: distractor === lastUserAnswer
						? "danger"
						: distractor === lastResult?.correctAnswer
							? "success"
							: "secondary"
				: "secondary"}
			appearance={showResult && distractor === lastUserAnswer ? "filled" : "outline"}
			name="userAnswer"
			value={distractor}
			text={distractor}
			fullWidth={true}
			title={`Press '${Object.entries(KEYBOARD_MAP).find(([_, i]) => i === index)?.[0] || ""}' to select`}
		/>
	{/each}
</div>
