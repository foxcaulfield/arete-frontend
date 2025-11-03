<script lang="ts">
	import Button from "$lib/components/common/Button.svelte";

	interface Props {
		mode: "create" | "edit";
		formAction: string;
		initialValues?: { name?: string; description?: string };
		formErrors?: Record<string, string | string[]>;
		generalError?: string;
		onCancel: () => void;
	}

	let { mode, formAction, initialValues = {}, formErrors = {}, generalError, onCancel }: Props = $props();

	// Normalize errors to array
	const getFieldErrors = (field: string): string[] => {
		const error = formErrors[field];
		if (!error) return [];
		return Array.isArray(error) ? error : [error];
	};

	const hasNameError = $derived(getFieldErrors("name").length > 0);
	const hasDescriptionError = $derived(getFieldErrors("description").length > 0);
	const hasAnyError = $derived(hasNameError || hasDescriptionError);
	const title = $derived(mode === "create" ? "New Collection" : "Edit Collection");
	const submitText = $derived(mode === "create" ? "Create Collection" : "Update Collection");
</script>

<!-- Main Form Container -->
<div class="w-full p-4 md:p-6">
	<div class="mx-auto max-w-4xl">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="h3 font-bold">{title}</h1>
		</div>

		<!-- Error Alert -->
		{#if generalError}
			<div
				class="mb-4 flex items-start gap-2 rounded-lg border border-error-800 bg-error-900 p-3 text-sm text-error-400"
			>
				<svg class="mt-0.5 h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
						clip-rule="evenodd"
					/>
				</svg>
				<div>{generalError}</div>
			</div>
		{/if}

		<form action={formAction} method="POST" class="space-y-4">
			<!-- Title Field -->
			<div>
				<label for="name" class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase">
					Title <span class="text-error-600">*</span>
				</label>
				<input
					id="name"
					type="text"
					name="name"
					value={initialValues?.name ?? ""}
					autocomplete="off"
					placeholder="e.g., Spanish Vocabulary Level 1"
					required
					class={`w-full rounded border bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none ${
						hasNameError ? "border-error-600" : "border-surface-600"
					}`}
				/>
				{#if hasNameError}
					<p class="mt-1 text-xs text-error-500">{getFieldErrors("name")[0]}</p>
				{/if}
			</div>

			<!-- Description Field -->
			<div>
				<label
					for="description"
					class="mb-2 block text-xs font-semibold tracking-wide text-surface-300 uppercase"
				>
					Description <span class="text-xs font-normal text-surface-400">(Optional)</span>
				</label>
				<textarea
					id="description"
					name="description"
					value={initialValues?.description ?? ""}
					placeholder="Add details about this collection... What topics does it cover? Who is it for?"
					rows="4"
					class={`w-full resize-none rounded border bg-surface-800 px-3 py-2 text-sm text-surface-100 placeholder-surface-500 focus:border-transparent focus:ring-2 focus:ring-primary-500 focus:outline-none ${
						hasDescriptionError ? "border-error-600" : "border-surface-600"
					}`}
				></textarea>
				{#if hasDescriptionError}
					<p class="mt-1 text-xs text-error-500">{getFieldErrors("description")[0]}</p>
				{/if}
			</div>

			<!-- Form Actions -->
			<div class="mt-6 flex items-center justify-between gap-2 border-t border-surface-700 pt-4">
				<div class="text-xs text-surface-400">
					{#if hasAnyError}
						<span class="font-medium text-error-500">Please fix errors</span>
					{:else}
						<span>Ready to submit</span>
					{/if}
				</div>
				<div class="flex gap-2">
					<Button
						text="Cancel"
						type="button"
						color="secondary"
						preset="outlined"
						size="sm"
						onclick={onCancel}
					/>
					<Button text={submitText} type="submit" color="primary" size="sm" />
				</div>
			</div>
		</form>
	</div>
</div>
