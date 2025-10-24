<script lang="ts">
	import type { PageProps } from "./$types";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import Button from "$lib/components/Button.svelte";

	let props: PageProps = $props();
	// const { serverData } = data;

	let isUnauthorized = $derived(Boolean(props.data?.flags?.unauthorized));
</script>

{#if isUnauthorized}
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

		<Button text="Create Collection" type="submit" />
	</form>
{/if}
