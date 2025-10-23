<script lang="ts">
	import type { PageProps } from "./$types";
	import Unauthorized from "$lib/components/Unauthorized.svelte";

	let props: PageProps = $props();
	// const { serverData } = data;
</script>

{#if props.data.flags?.unauthorized}
	<Unauthorized message="You are not authorized to create a collection." />
{:else}
	<h1>Create Collection</h1>

	<form method="POST" action="?/create">
		<label>
			Name
			<input
				name="name"
				placeholder="Collection Name"
				required
				value={props.form?.values?.name ?? ""}
			/>
			<!-- {#if props.form?.?.name}<small>{props.form.fieldErrors.name}</small>{/if} -->
		</label>

		<label>
			Description
			<input name="description" placeholder="Description (optional)" value={props.form?.values?.description ?? ""} />
		</label>

		{#if props.form?.message}
			<p style="color: red;">{props.form.message}</p>
		{/if}

		<button type="submit">Create Collection</button>
	</form>
{/if}
