<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "./Button.svelte";

	const props: { exercises: Exercise.ResponseDto[] } = $props();
</script>

<div class="table-container">
	<table>
	<thead>
		<tr>
			<th></th>
			<!-- <th>id</th> -->
			<th>question</th>
			<th>type</th>
			<th>answer</th>
			<!-- <th>collectionId</th> -->
			<!-- <th>explanation</th> -->
			<th>createdAt</th>
			<th>updatedAt</th>
		</tr>
	</thead>
	<tbody>
				{#each props.exercises as exercise (exercise.id)}
					<tr>
						<!-- update button -->
						<td><Button text="Edit" size="sm" onclick={() => goto(`/collections/view/${exercise.collectionId}/exercises/edit/${exercise.id}`)}/></td>
						<!-- <td>{exercise.id}</td> -->
						<td>{exercise.question}</td>
						<td>{exercise.type}</td>
						<td>{exercise.correctAnswer}</td>
						<!-- <td>{exercise.collectionId}</td> -->
						<!-- <td>{exercise.explanation}</td> -->
						<td>{exercise.createdAt} ago</td>
						<td>{exercise.updatedAt} ago</td>
					</tr>
				{/each}
	</tbody>
	</table>
</div>
