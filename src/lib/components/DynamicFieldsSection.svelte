<script lang="ts">
	import Button from "$lib/components/common/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";

	interface FieldItem {
		id: number;
		value: string;
	}

	interface Props {
		label: string;
        name: string;
		description: string;
		items: FieldItem[];
		placeholder: string;
		onAdd: () => void;
		onRemove: (id: number) => void;
		errors?: string | string[];
		minMax?: [number, number];
	}

	let { label, name, description, items = [], placeholder, onAdd, onRemove, errors, minMax }: Props =
		$props();

	function getErrorMessage(fieldErrors: string | string[] | undefined): string | undefined {
		if (!fieldErrors) return undefined;
		return Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
	}
</script>

<div class="form-group">
	<label class="label" for={label.toLowerCase().replace(/\s+/g, "-")}>{label}</label>
	<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
		{description}
	</p>
	<Button text="Add Item" type="button" color="secondary" onclick={onAdd} />

	{#each items as item (item.id)}
		<div class="dynamic-field-row">
			<TextInput
				{errors}
				name={name}
				id={item.id > 0 ? `${label.toLowerCase().replace(/\s+/g, "-")}-${item.id}` : label.toLowerCase().replace(/\s+/g, "-")}
				value={item.value}
				{placeholder}
				{minMax}
			/>
			<Button
				text="Remove"
				type="button"
				appearance="ghost"
				onclick={() => onRemove(item.id)}
			/>
		</div>
	{/each}

	{#if errors}
		<span class="field-error">{getErrorMessage(errors)}</span>
	{/if}
</div>

<style>
	.dynamic-field-row {
		display: flex;
		gap: 0.5rem;
		align-items: flex-start;
		margin-top: 0.75rem;
	}

	.form-group {
		width: 100%;
	}
</style>
