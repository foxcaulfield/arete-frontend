<script lang="ts">
	import type { ClassValue } from "svelte/elements";

	type CommonProps = {
		text: string;
		type?: "button" | "submit" | "reset";
		name?: string;
		value?: string;
		title?: string;
		preset?: StyleProps.Preset;
		color?: StyleProps.Color;
		size?: StyleProps.Size;
		disabled?: boolean;
		loading?: boolean;
		icon?: boolean;
		buttonElement?: HTMLButtonElement | undefined;
		class?: ClassValue;
		fullWidth?: boolean;
		action?: string;
		onsubmit?: (e: Event) => void;
		onclick?: (e: Event) => void;
		[rest: string]: any;
	};

	type WithAction = { withAction: true; action: string; onsubmit?: (e: Event) => void };
	type WithoutAction = { withAction?: false };
	type ButtonProps = CommonProps & (WithAction | WithoutAction);

	let {
		text,
		type,
		name,
		value,
		title,
		preset = "filled",
		color = "primary",
		size = "base",
		disabled: disabledProp = false,
		class: cls,
		withAction,
		action,
		onsubmit,
		buttonElement = $bindable(),
		loading = false,
		icon = false,
		fullWidth = false,
		...rest
	}: ButtonProps = $props();

	const disabled = $derived(disabledProp || loading);

	// Static preset mapping - use complete class names for Tailwind detection
	const presetColorMap: Record<string, Record<string, string>> = {
		filled: {
			primary: "preset-filled-primary-500",
			secondary: "preset-filled-secondary-500",
			tertiary: "preset-filled-tertiary-500",
			success: "preset-filled-success-500",
			warning: "preset-filled-warning-500",
			error: "preset-filled-error-500",
			surface: "preset-filled-surface-500",
		},
		outlined: {
			primary: "preset-outlined-primary-500",
			secondary: "preset-outlined-secondary-500",
			tertiary: "preset-outlined-tertiary-500",
			success: "preset-outlined-success-500",
			warning: "preset-outlined-warning-500",
			error: "preset-outlined-error-500",
			surface: "preset-outlined-surface-500",
		},
		ghost: {
			primary: "hover:preset-tonal-primary",
			secondary: "hover:preset-tonal-secondary",
			tertiary: "hover:preset-tonal-tertiary",
			success: "hover:preset-tonal-success",
			warning: "hover:preset-tonal-warning",
			error: "hover:preset-tonal-error",
			surface: "hover:preset-tonal-surface",
		},
		tonal: {
			primary: "preset-tonal-primary",
			secondary: "preset-tonal-secondary",
			tertiary: "preset-tonal-tertiary",
			success: "preset-tonal-success",
			warning: "preset-tonal-warning",
			error: "preset-tonal-error",
			surface: "preset-tonal-surface",
		},
	};

	const presetClass = $derived(presetColorMap[preset]?.[color] ?? "preset-filled-primary-500");
</script>

<svelte:element
	this={withAction ? "form" : "span"}
	method={withAction ? "POST" : undefined}
	action={withAction ? action : undefined}
	onsubmit={withAction ? onsubmit : undefined}
	style:display={withAction ? "inline" : "inline-block"}
>
	<button
		name={name}
		value={value}
		title={title}
		bind:this={buttonElement}
		type={type ?? (withAction ? "submit" : "button")}
		{disabled}
		class={[
			"btn",
			`btn-${size}`,
			presetClass,
			cls,
			fullWidth ? "full-width" : "",
		]
			.filter(Boolean)
			.join(" ")}
	{...rest}
	>
		{#if loading}
			<span class="spinner"></span>
		{/if}
		<span>{text}</span>
	</button>
</svelte:element>

<style lang="scss">
	/* Error color preset support - fallback for when CSS variables aren't defined */

	.full-width {
		width: 100%;
	}

	/* Loading state */
	.loading {
		pointer-events: none;
	}

	.spinner {
		display: inline-block;
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	// .preset-glass-primary {
	// 	background: color-mix(in oklab, var(--color-primary-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-primary-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-secondary {
	// 	background: color-mix(in oklab, var(--color-secondary-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-secondary-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-tertiary {
	// 	background: color-mix(in oklab, var(--color-tertiary-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-tertiary-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-success {
	// 	background: color-mix(in oklab, var(--color-success-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-success-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-warning {
	// 	background: color-mix(in oklab, var(--color-warning-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-warning-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-error {
	// 	background: color-mix(in oklab, var(--color-error-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-error-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }

	// .preset-glass-surface {
	// 	background: color-mix(in oklab, var(--color-surface-500) 40%, transparent);
	// 	box-shadow: 0 0px 30px color-mix(in oklab, var(--color-surface-500) 50%, transparent) inset;
	// 	backdrop-filter: blur(16px);
	// }
</style>
