<script lang="ts">
	import TextInput from "./TextInput.svelte";

	interface FormGroupTextInputProps {
		cssClass?: string;
		value: string;
		placeholder?: string;
		idName: string;
		label?: string;
		errorText?: string;
		minMax: [number, number];
		required?: boolean;
		// [rest: string]: any;
	}
	const props: FormGroupTextInputProps = $props();
</script>

<div class={props.cssClass}>
	<label for={props.idName}>{props.label}</label>
	<TextInput
		id={props.idName}
		name={props.idName}
		value={props.value}
		placeholder={props.placeholder}
		required={props.required}
		minlength={props.minMax[0]}
		maxlength={props.minMax[1]}
		aria-invalid={props.errorText ? "true" : "false"}
		aria-describedby={props.errorText ? `${props.idName}-error` : undefined}
	/>
	{#if props.errorText}
		<span id={`${props.idName}-error`} class="field-error">{props.errorText}</span>
	{/if}
</div>
