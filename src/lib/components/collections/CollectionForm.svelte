<script lang="ts">
	import Button from "$lib/components/common/Button.svelte";
	import { AlertCircleIcon } from "@lucide/svelte";

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

	const hasErrors = $derived(Object.keys(formErrors).length > 0);
	const title = $derived(mode === "create" ? "New Collection" : "Edit Collection");
	const subtitle = $derived(
		mode === "create"
			? "Create a new collection to organize your exercises and drills."
			: "Update details for this collection."
	);
	const submitText = $derived(mode === "create" ? "Create" : "Save");
</script>

<div class="space-y-4 p-4">
	<!-- Header Section -->
	<div class="flex items-start justify-between">
		<div class="flex-1 min-w-0">
			<h1 class="h3 mb-1">{title}</h1>
			<p class="text-xs opacity-60">{subtitle}</p>
		</div>
		<Button text="Cancel" onclick={onCancel} preset="ghost" size="sm" />
	</div>

	<!-- Form Card -->
	<div class="card preset-filled-surface-100-900 p-4">
		<!-- General Error Alert -->
		{#if generalError}
			<div class="mb-4 bg-red-500/10 border-l-4 border-red-500 rounded p-3 flex gap-3">
				<AlertCircleIcon class="size-5 text-red-500 flex-shrink-0 mt-0.5" />
				<div class="flex-1 min-w-0">
					<p class="text-sm font-semibold text-red-600">Unable to {mode} collection</p>
					<p class="text-xs text-red-600 opacity-90">{generalError}</p>
				</div>
			</div>
		{/if}

		<form method="POST" action={formAction} class="space-y-4">
			<!-- Form Fields -->
			<div class="space-y-4">
				<!-- Name Field -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<label for="name" class="text-sm font-semibold">Title</label>
						<span class="text-xs opacity-50 font-medium">Required</span>
					</div>
					<input
						id="name"
						name="name"
						type="text"
						placeholder="e.g., Spanish Vocabulary Level 1"
						required
						value={initialValues?.name ?? ""}
						class={`input ${getFieldErrors("name").length > 0 ? "border-red-500 focus:ring-red-500" : ""}`}
					/>
					{#if getFieldErrors("name").length === 0}
						<!-- <p class="text-xs opacity-50">Choose a clear, descriptive name for your collection.</p> -->
					{:else}
						<div class="space-y-1">
							{#each getFieldErrors("name") as error (error)}
								<div class="flex gap-2 items-start">
									<AlertCircleIcon class="size-3.5 text-red-500 flex-shrink-0 mt-0.5" />
									<span class="text-xs text-red-500 font-medium">{error}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<!-- Description Field -->
				<div class="space-y-1.5">
					<div class="flex items-center justify-between">
						<label for="description" class="text-sm font-semibold">Description</label>
						<span class="text-xs opacity-50 font-medium">Optional</span>
					</div>
					<textarea
						id="description"
						name="description"
						placeholder="Add details about this collection... What topics does it cover? Who is it for?"
						rows={4}
						class={`textarea resize-none ${getFieldErrors("description").length > 0 ? "border-red-500 focus:ring-red-500" : ""}`}
					>{initialValues?.description ?? ""}</textarea>
					{#if getFieldErrors("description").length === 0}
						<!-- <p class="text-xs opacity-50">Help others understand the purpose and content of this collection.</p> -->
					{:else}
						<div class="space-y-1">
							{#each getFieldErrors("description") as error (error)}
								<div class="flex gap-2 items-start">
									<AlertCircleIcon class="size-3.5 text-red-500 flex-shrink-0 mt-0.5" />
									<span class="text-xs text-red-500 font-medium">{error}</span>
								</div>
							{/each}
						</div>
					{/if}
				</div>
			</div>

			<!-- Form Status -->
			{#if hasErrors}
				<div class="bg-orange-500/10 border border-orange-500/30 rounded p-3 flex gap-2">
					<AlertCircleIcon class="size-4 text-orange-600 flex-shrink-0 mt-0.5" />
					<p class="text-xs text-orange-600">Please fix the errors above and try again.</p>
				</div>
			{/if}

			<!-- Actions -->
			<div class="flex gap-2 pt-3 border-t border-opacity-20">
				<Button text={submitText} type="submit" fullWidth={true} />
				<Button text="Cancel" type="button" color="secondary" fullWidth={true} onclick={onCancel} />
			</div>
		</form>
	</div>
</div>
