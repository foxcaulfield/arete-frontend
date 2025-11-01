<script lang="ts">
	const props: { translationText: string } = $props();
</script>

<div class="translation">
	Translation: {props.translationText}
</div>

<style>
	.translation {
		margin: 0.5rem 0 1rem 0;
		font-size: 0.9rem;
		color: var(--muted, #667085);
	}
</style>
