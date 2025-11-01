<script lang="ts">
	import type { PageProps } from "./$types";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import Button from "$lib/components/common/Button.svelte";

	let props: PageProps = $props();
	let isUnauthorized = $derived(Boolean(props.data?.flags?.unauthorized));
</script>

{#if isUnauthorized}
	<Unauthorized message="You are not authorized to create a collection." />
{:else}
	<div>
		<div>
			<h1>Create Collection</h1>
			<p>Add fields to describe the collection — this form is ready to grow.</p>
		</div>

		<form method="POST" action="?/create">
			<div>
				<div>
					<label for="name" class="label">Name</label>
					<input
						id="name"
						name="name"
						placeholder="Collection Name"
						required
						value={props.form?.values?.name ?? ""}
					/>
					{#if (props.form as any)?.fieldErrors?.name}
						<span class="field-error">{(props.form as any).fieldErrors.name}</span>
					{/if}
				</div>

				<div>
					<label for="description" class="label">Description</label>
					<textarea id="description" name="description" placeholder="Description (optional)"
						>{props.form?.values?.description ?? ""}</textarea
					>
					{#if (props.form as any)?.fieldErrors?.description}
						<span>{(props.form as any).fieldErrors.description}</span>
					{/if}
				</div>
			</div>

			{#if (props.form as any)?.message}
				<div><span>{(props.form as any).message}</span></div>
			{/if}

			<div>
				<Button text="Create Collection" type="submit" />
				<Button text="Cancel" type="button" color="secondary" onclick={() => history.back()} />
			</div>
		</form>
	</div>
{/if}
