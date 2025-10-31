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
				<th class="question-column">question</th>
				<th>answer</th>
				<th>type</th>
				<!-- <th>collectionId</th> -->
				<!-- <th>explanation</th> -->
				<!-- <th>createdAt</th>
			<th>updatedAt</th> -->
			</tr>
		</thead>
		<tbody>
			{#each props.exercises as exercise (exercise.id)}
				<tr>
					<!-- update button -->
					<td
						><Button
							text="Edit"
							size="sm"
							onclick={() =>
								goto(`/collections/view/${exercise.collectionId}/exercises/edit/${exercise.id}`)}
						/></td
					>
					<!-- <td>{exercise.id}</td> -->
					<td class="question-column">{exercise.question}</td>
					<td>{exercise.correctAnswer}</td>
					<td>{exercise.type}</td>
					<!-- <td>{exercise.collectionId}</td> -->
					<!-- <td>{exercise.explanation}</td> -->
					<!-- <td>{exercise.createdAt} ago</td> -->
					<!-- <td>{exercise.updatedAt} ago</td> -->
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.question-column {
		width: 450px; /* Adjust this value to your preferred width */
		min-width: 450px;
		max-width: 450px;
		word-wrap: break-word;
		white-space: normal;
	}
	
	/* Ensure table respects the column widths */
	.table-container table {
		table-layout: fixed;
		width: 100%;
	}
</style>