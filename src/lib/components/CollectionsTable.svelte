<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	let props: { collections: ResponseCollectionDTO[] } = $props();

	function open(id: string) {
		const query = page.url.search;
		goto(`/collections/view/${id}${query}`);
	}
</script>

<div class="table-container">
	<table>
		<thead>
			<tr>
				<th>Name</th>
				<th>Description</th>
				<th>User name</th>
				<th>Created At</th>
				<th>Updated At</th>
			</tr>
		</thead>
		<tbody>
			{#each props.collections as collection (collection.id)}
				<tr
					class="clickable-row"
					role="button"
					tabindex="0"
					onclick={() => open(collection.id)}
					onkeydown={(e) => {
						if (e.key === "Enter" || e.key === " ") open(collection.id);
					}}
				>
					<td>{collection.name}</td>
					<td>{collection.description}</td>
					<td>{collection.user?.name}</td>
					<td>{collection.createdAt}</td>
					<td>{collection.updatedAt}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
