<script lang="ts">
	import { getTypeDesc, getTypeIcon, getTypeLabel } from "$lib/utils/exercise-type.utils";

	interface Props {
		exerciseType: ExerciseType;
	}
	let { exerciseType }: Props = $props();
</script>

<div class="question-type-row">
	<span class="type-badge" title={getTypeLabel(exerciseType)}>
		{@html getTypeIcon(exerciseType)}
	</span>
	<div class="type-info">
		<div class="type-name">{getTypeLabel(exerciseType)}</div>
		<div class="type-desc">{getTypeDesc(exerciseType)}</div>
	</div>
</div>

<style>
	.question-type-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin: 0.4rem 0;
	}
    
	.type-badge {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border-radius: 8px;
		/* background: var(--card-bg, #f5f7fa); */
		color: var(--muted, #334155);
		flex: 0 0 40px;
	}

	.type-info {
		display: flex;
		flex-direction: column;
	}

	.type-name {
		font-weight: 600;
		font-size: 0.95rem;
	}

	.type-desc {
		font-size: 0.82rem;
		color: var(--muted, #667085);
	}
</style>
