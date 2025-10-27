<script lang="ts">
	import TextInput from "./TextInput.svelte";

	interface FormGroupTextInputProps {
		cssClass?: string;
		value: string;
		placeholder?: string;
		idName: string;
		label?: string;
		errorText?: string;
		minMax?: [number, number];
		required?: boolean;
		inputElement?: HTMLInputElement;
		[rest: string]: any;
	}
	let {
		cssClass,
		value = $bindable(),
		placeholder,
		idName,
		label,
		errorText,
		minMax = [0, 1000],
		required,
		inputElement = $bindable(),
		...rest
	}: FormGroupTextInputProps = $props();
</script>

<div class={`form-group ${cssClass ?? ""}`}>
	{#if label}
		<label for={idName} class="label">{label}</label>
	{/if}
	<TextInput
		id={idName}
		name={idName}
		bind:value
		bind:inputElement
		{placeholder}
		{required}
		minlength={minMax[0]}
		maxlength={minMax[1]}
		aria-invalid={errorText ? "true" : "false"}
		aria-describedby={errorText ? `${idName}-error` : undefined}
		{...rest}
	/>
	{#if errorText}
		<span id={`${idName}-error`} class="field-error">{errorText}</span>
	{/if}
</div>

<style>
	.form-group {
		flex: 1;
		width: 100%;
	}
</style>
