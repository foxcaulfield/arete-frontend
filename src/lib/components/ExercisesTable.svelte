<script lang="ts">
	const props: { exercises: ResponseExerciseDTO[] } = $props();
</script>

<table>
	<thead>
		<tr>
			<th>id</th>
			<th>question</th>
			<th>collectionId</th>
			<th>explanation</th>
			<th>createdAt</th>
			<th>updatedAt</th>
		</tr>
	</thead>
	<tbody>
		{#each props.exercises as exercise (exercise.id)}
			<tr>
				<td>{exercise.id}</td>
				<td>{exercise.question}</td>
				<td>{exercise.collectionId}</td>
				<td>{exercise.explanation}</td>
				<td>{exercise.createdAt}</td>
				<td>{exercise.updatedAt}</td>
			</tr>
		{/each}
	</tbody>
</table>

<style>
	table {
		width: 100%;
		border-collapse: collapse;
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
		box-shadow: var(--shadow-lg);
		border-radius: var(--radius-lg);
		overflow: hidden;
		border: 1px solid var(--color-border-primary);
		backdrop-filter: blur(10px);
	}

	th,
	td {
		padding: 12px 16px;
		text-align: left;
	}

	th {
		background: linear-gradient(90deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 69, 0, 0.05) 100%);
		color: var(--color-accent-primary);
		font-weight: 700;
		text-transform: uppercase;
		font-size: 0.875rem;
		letter-spacing: 0.5px;
		border-bottom: 2px solid var(--color-border-secondary);
	}

	tbody tr {
		transition: all var(--transition-fast);
		border-bottom: 1px solid var(--color-border-primary);
		cursor: pointer;
	}

	tbody tr:hover {
		background: rgba(255, 107, 53, 0.08);
		transform: scale(1.01);
		box-shadow: inset 0 0 10px rgba(255, 107, 53, 0.1);
	}

	tbody tr:nth-child(odd) {
		background: rgba(15, 15, 15, 0.3);
	}

	tbody tr:nth-child(even) {
		background: rgba(20, 20, 20, 0.3);
	}

	td {
		color: var(--color-text-secondary);
		font-size: 0.95rem;
	}

	tbody tr:hover td {
		color: var(--color-text-primary);
	}
</style>
