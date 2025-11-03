<script lang="ts">
	import { goto } from "$app/navigation";
	import { page } from "$app/state";
	let props: { collections: Collection.ResponseDto[] } = $props();

	function open(id: string) {
		const query = page.url.search;
		goto(`/collections/view/${id}${query}`);
	}
</script>

<div class="table-wrap">
	<table class="table caption-top w-full">
		<!-- <caption class="pt-4">A list of collections.</caption> -->
		<thead>
			<tr>
				<th>Name</th>
				<th>Description</th>
				<th>User name</th>
				<th>Created At</th>
				<th>Updated At</th>
			</tr>
		</thead>
		<tbody class="[&>tr]:hover:preset-tonal-primary">
			{#each props.collections as collection (collection.id)}
				<!-- class="clickable-row" -->
				<tr
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
