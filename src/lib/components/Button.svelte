<script lang="ts">
	import type { ClassValue } from "svelte/elements";

	type Variant = "primary" | "secondary" | "danger" | "success";
	type Style = "filled" | "outline" | "ghost";
	type Size = "sm" | "md" | "lg";
	type Rounded = "none" | "sm" | "md" | "lg" | "full";

	type CommonProps = {
		text: string;
		type?: "button" | "submit" | "reset";
		variant?: Variant;
		appearance?: Style;
		size?: Size;
		rounded?: Rounded;
		disabled?: boolean;
		loading?: boolean;
		icon?: boolean;
		buttonElement?: HTMLButtonElement | undefined;
		class?: ClassValue;
		fullWidth?: boolean;
		[rest: string]: any;
	};

	type WithAction = { withAction: true; action: string; onsubmit?: (e: Event) => void };
	type WithoutAction = { withAction?: false };
	type ButtonProps = CommonProps & (WithAction | WithoutAction);

	let {
		text,
		withAction,
		action,
		onsubmit,
		type,
		buttonElement = $bindable(),
		variant = "primary",
		appearance: style = "filled",
		size = "md",
		rounded = "sm",
		disabled: disabledProp = false,
		loading = false,
		icon = false,
		class: cls,
		fullWidth = false,
		...rest
	}: ButtonProps = $props();

	const disabled = $derived(disabledProp || loading);
</script>

<svelte:element
	this={withAction ? "form" : "span"}
	method={withAction ? "POST" : undefined}
	action={withAction ? action : undefined}
	onsubmit={withAction ? onsubmit : undefined}
	style:display={withAction ? "inline" : "inline-block"}
>
	<button
		bind:this={buttonElement}
		type={type ?? (withAction ? "submit" : "button")}
		{disabled}
		class={[
			"btn",
			`size-${size}`,
			`rounded-${rounded}`,
			`variant-${variant}`,
			`style-${style}`,
			icon && "icon",
			loading && "loading",
			cls,
			fullWidth && "full-width",
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
	button {
		font-family: inherit;
		font-weight: 600;
		font-size: 1rem;
		border: none;
		cursor: pointer;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5em;
		transition: all var(--transition);
		position: relative;
		letter-spacing: 0.5px;

		&:disabled {
			opacity: 0.5;
			cursor: not-allowed;
		}
	}

	.full-width {
		width: 100%;
	}

	/* Size variants */
	.size-sm {
		padding: 0.4em 0.75em;
		font-size: 0.875rem;
	}

	.size-md {
		padding: 0.55em 1.1em;
		font-size: 1rem;
	}

	.size-lg {
		padding: 0.7em 1.4em;
		font-size: 1.125rem;
	}

	/* Rounded variants */
	.rounded-none {
		border-radius: 0;
	}

	.rounded-sm {
		border-radius: var(--radius-sm);
	}

	.rounded-md {
		border-radius: calc(var(--radius-sm) * 1.5);
	}

	.rounded-lg {
		border-radius: var(--radius);
	}

	.rounded-full {
		border-radius: 9999px;
	}

	/* Base filled style */
	.style-filled {
		box-shadow: var(--shadow-2);

		&:hover:not(:disabled) {
			// transform: translateY(-2px);
			box-shadow: var(--shadow-1);
		}

		&:active:not(:disabled) {
			// transform: translateY(0);
			box-shadow: var(--shadow-2);
		}
	}

	/* Base outline style */
	.style-outline {
		background: transparent;
		box-shadow: none;
		border: 2px solid;

		&:hover:not(:disabled) {
			// transform: translateY(-1px);
		}
	}

	/* Base ghost style */
	.style-ghost {
		background: transparent;
		box-shadow: none;
		border: none;
		color: var(--muted);

		&:hover:not(:disabled) {
			// transform: translateY(-1px);
			background: var(--bg-alt);
		}
	}

	/* PRIMARY VARIANT */
	.variant-primary {
		&.style-filled {
			background: var(--accent);
			color: #fff;

			&:hover:not(:disabled) {
				background: var(--accent-2);
			}

			&:active:not(:disabled) {
				background: var(--accent-strong);
			}
		}

		&.style-outline {
			border-color: var(--accent);
			color: var(--accent);

			&:hover:not(:disabled) {
				background: rgba(255, 60, 0, 0.08);
				border-color: var(--accent-2);
				color: var(--accent-2);
			}
		}

		&.style-ghost {
			color: var(--accent);

			&:hover:not(:disabled) {
				background: rgba(255, 60, 0, 0.1);
				color: var(--accent-2);
			}
		}
	}

	/* SECONDARY VARIANT */
	.variant-secondary {
		&.style-filled {
			background: var(--bg-alt);
			color: var(--text);
			// border: 2px solid var(--border-color);

			&:hover:not(:disabled) {
				background: var(--surface);
				border-color: var(--accent);
			}
		}

		&.style-outline {
			border-color: var(--border-color);
			color: var(--text);

			&:hover:not(:disabled) {
				background: var(--bg-alt);
				border-color: var(--accent);
				color: var(--accent);
			}
		}

		&.style-ghost {
			color: var(--muted);

			&:hover:not(:disabled) {
				background: var(--bg-alt);
				color: var(--accent);
			}
		}
	}

	/* DANGER VARIANT */
	.variant-danger {
		&.style-filled {
			background: var(--accent-strong);
			color: #fff;

			&:hover:not(:disabled) {
				background: #c41f00;
			}
		}

		&.style-outline {
			border-color: var(--accent-strong);
			color: var(--accent-strong);

			&:hover:not(:disabled) {
				background: rgba(214, 40, 0, 0.08);
			}
		}

		&.style-ghost {
			color: var(--accent-strong);

			&:hover:not(:disabled) {
				background: rgba(214, 40, 0, 0.1);
			}
		}
	}

	/* SUCCESS VARIANT */
	.variant-success {
		&.style-filled {
			background: var(--success);
			color: #000;
			font-weight: 700;

			&:hover:not(:disabled) {
				background: #00ff94;
			}
		}

		&.style-outline {
			border-color: var(--success);
			color: var(--success);

			&:hover:not(:disabled) {
				background: rgba(26, 255, 140, 0.08);
			}
		}

		&.style-ghost {
			color: var(--success);

			&:hover:not(:disabled) {
				background: rgba(26, 255, 140, 0.1);
			}
		}
	}

	/* Icon button */
	.icon {
		padding: 0.5em;
		border-radius: 50%;
		aspect-ratio: 1;
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

	/* button:hover,
	.button:hover {
		background: var(--accent-2);
		transform: translateY(-1px);
	}

	button:active,
	.button:active {
		transform: translateY(0);
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	button:disabled:hover,
	.button:disabled:hover {
		transform: none;
		background: var(--accent);
	} */

	/* small utility for inline action buttons inside form groups */
	// .form-group>.button {
	// 	align-self: flex-start
	// }

	/* smaller inline buttons for add/remove rows */
	// .alt-answer-row .button {
	// 	padding: .32em .6em;
	// 	font-size: .9rem
	// }

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
</style>
