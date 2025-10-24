<script lang="ts">
	interface FormGroupTextareaProps {
		cssClass?: string;
		value: string;
		errorText?: string;
		idName: string;
		label?: string;
		placeholder?: string;
		minMax: [number, number];
        required?: boolean;
		// [rest: string]: any;
	}
	const props: FormGroupTextareaProps = $props();
</script>

<div class={props.cssClass}>
	<label for={props.idName}>{props.label}</label>
	<textarea
		id={props.idName}
		name={props.idName}
		value={props.value}
		placeholder={props.placeholder}
		required={props.required}
		minlength={props.minMax[0]}
		maxlength={props.minMax[1]}
		aria-invalid={props.errorText ? "true" : "false"}
		aria-describedby={props.errorText ? `${props.idName}-error` : undefined}
	></textarea>
	{#if props.errorText}
		<span id={`${props.idName}-error`} class="field-error">{props.errorText}</span>
	{/if}
</div>
