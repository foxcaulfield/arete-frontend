<script lang="ts">
	import type { PageProps } from "./$types";
	import Unauthorized from "$lib/components/Unauthorized.svelte";
	import Button from "$lib/components/Button.svelte";

	let props: PageProps = $props();
	let isUnauthorized = $derived(Boolean(props.data?.flags?.unauthorized));
</script>

{#if isUnauthorized}
	<Unauthorized message="You are not authorized to create a collection." />
{:else}
	<div class="container">
		<div class="card-lg">
			<h1>Create Collection</h1>
			<p class="muted" style="margin-top:.5rem">Add fields to describe the collection — this form is ready to grow.</p>
		</div>

			<form method="POST" action="?/create" class="card form-card" style="margin-top:1rem">
				<div class="form-grid">
					<div class="form-group">
						<label for="name" class="label">Name</label>
						<input
							id="name"
							name="name"
							class="text-input"
							placeholder="Collection Name"
							required
							value={props.form?.values?.name ?? ""}
						/>
									{#if (props.form as any)?.fieldErrors?.name}
										<span class="field-error">{(props.form as any).fieldErrors.name}</span>
									{/if}
					</div>

					<div class="form-group">
						<label for="description" class="label">Description</label>
						<textarea
							id="description"
							name="description"
							class="text-area"
							placeholder="Description (optional)"
						>{props.form?.values?.description ?? ""}</textarea>
									{#if (props.form as any)?.fieldErrors?.description}
										<span class="field-error">{(props.form as any).fieldErrors.description}</span>
									{/if}
					</div>
				</div>

					{#if (props.form as any)?.message}
						<div style="margin-top:.6rem"><span class="field-error">{(props.form as any).message}</span></div>
					{/if}

					<div class="actions-row actions-right" style="margin-top:1rem">
						<Button text="Create Collection" type="submit" />
						<Button text="Cancel" type="button" variant="secondary" onclick={() => history.back()} />
					</div>
		</form>
	</div>
{/if}
