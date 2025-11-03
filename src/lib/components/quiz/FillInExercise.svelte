<script lang="ts">
	import Button from "../common/Button.svelte";
	import FormGroupTextInput from "../FormGroupTextInput.svelte";

	interface Props {
		showResult: boolean;
		userAnswer: string;
		inputElement: HTMLInputElement | undefined;
	}

	let { showResult, userAnswer = $bindable(), inputElement = $bindable() }: Props = $props();
</script>

<div class="fill-in-exercise">
	<FormGroupTextInput
		disabled={showResult}
		class="text-input"
		idName="userAnswer"
		placeholder="Enter your answer"
		autocomplete="off"
		bind:value={userAnswer}
		bind:inputElement
	/>
	<Button
		text="Answer"
		type="submit"
		color={userAnswer && !showResult ? "primary" : "secondary"}
		disabled={showResult || !userAnswer.trim()}
	/>
</div>

<style>
	.fill-in-exercise {
		display: flex;
		flex-direction: row;
		gap: 10px;
	}
</style>
