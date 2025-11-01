<script lang="ts">
	import { goto } from "$app/navigation";
	import Button from "../common/Button.svelte";

	const props: { exercises: Exercise.ResponseDto[] } = $props();
</script>

<div class="table-wrap">
	<table class="table caption-top w-full">
		<thead>
			<tr>
				<th></th>
				<th>question</th>
				<th>answer</th>
				<th>type</th>
			</tr>
		</thead>
		<tbody class="[&>tr]:hover:preset-tonal-primary">
			{#each props.exercises as exercise (exercise.id)}
				<tr>
					<td
						><Button
							text="Edit"
							size="sm"
							onclick={() =>
								goto(`/collections/view/${exercise.collectionId}/exercises/edit/${exercise.id}`)}
						/></td
					>
					<td>{exercise.question}</td>
					<td>{exercise.correctAnswer}</td>
					<td>{exercise.type}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
