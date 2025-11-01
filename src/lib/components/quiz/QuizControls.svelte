<script lang="ts">
	import { enhance } from "$app/forms";
	import type { SubmitFunction } from "@sveltejs/kit";
	import Button from "../Button.svelte";

	interface Props {
		showResult: boolean;
		handleGoToEditPage: () => void;
		handleForceTextInput: () => void;
		nextButtonElement?: HTMLButtonElement;
		handleGetNextQuestionEnhance: SubmitFunction;
	}

	let {
		showResult,
		handleGoToEditPage,
		handleForceTextInput,
		nextButtonElement = $bindable(),
		handleGetNextQuestionEnhance,
	}: Props = $props();
</script>

<div class="button-controls">
	<Button
		disabled={showResult}
		type="button"
		variant="secondary"
		appearance="ghost"
		size="sm"
		text="Force Text Input"
		onclick={handleForceTextInput}
	/>
	<Button type="button" variant="secondary" appearance="ghost" size="sm" text="✎" onclick={handleGoToEditPage}>
		<!-- text="✏️ Edit" -->
	</Button>
	<form method="POST" action="?/getNextQuestion" use:enhance={handleGetNextQuestionEnhance}>
		<Button
			type="submit"
			bind:buttonElement={nextButtonElement}
			variant="secondary"
			appearance="ghost"
			size="sm"
			text={`⟳`}
		/>
	</form>
</div>

<style>
	.button-controls {
		display: flex;
		gap: 0.5rem;
		justify-content: flex-end;
		margin-bottom: 1rem;
	}
</style>
