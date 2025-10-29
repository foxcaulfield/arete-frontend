<script lang="ts">
	import type { FullAutoFill } from "svelte/elements";
	type withLabel = {
		withLabel: string;
		id: string;
	};
	type withoutLabel = {
		withLabel?: undefined;
		id?: string;
	};
	type TextInputProps = {
		value?: string;
		autocomplete?: FullAutoFill;
		placeholder?: string;
		nameIsSameAsId?: boolean;
		inputElement?: HTMLInputElement;
		errors?: string | string[];
		[rest: string]: any;
	} & (withLabel | withoutLabel);

	// Mark `value` as bindable so parent components can use `bind:value={...}`
	let {
		value = $bindable(),
		autocomplete,
		placeholder,
		name,
		withLabel,
		id,
		nameIsSameAsId,
		inputElement = $bindable(),
		errors,
		...rest
	}: TextInputProps = $props();
</script>

<div>
	{#if withLabel}
		<label for={id} class="label">{withLabel}</label>
	{/if}
	<input
		class="text-input"
		bind:value
		bind:this={inputElement}
		autocomplete={autocomplete ?? "off"}
		type="text"
		placeholder={placeholder ?? "Enter text"}
		{id}
		name={nameIsSameAsId ? id : name}
		{...rest}
	/>

	{#if errors}
	<!-- comma separated list of errors -->
		{#if Array.isArray(errors)}
			<span class="field-error">{errors.join(', ')}</span>
		{:else}
			<span class="field-error">{errors}</span>
		{/if}
	{/if}
</div>
