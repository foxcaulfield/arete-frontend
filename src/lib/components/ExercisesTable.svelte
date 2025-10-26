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
