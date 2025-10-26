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
		[rest: string]: any;
	} & (withLabel | withoutLabel);

	// Mark `value` as bindable so parent components can use `bind:value={...}`
	let { value = $bindable(), autocomplete, placeholder, name, withLabel, id, nameIsSameAsId, inputElement = $bindable(), ...rest }: TextInputProps = $props();
</script>

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
	id={id}
	name={nameIsSameAsId ? id : name}
	{...rest}
/>
