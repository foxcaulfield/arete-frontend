<script lang="ts">
	/*
		Unified Button component
		Props:
			- text: button label
			- type: button|submit|reset
			- variant: primary|secondary|ghost|danger
			- withAction + action: render a form around the button for POST actions
			- ...rest: forwarded attributes
	*/
	type CommonProps = {
		text: string;
		type?: "button" | "submit" | "reset";
		variant?: "primary" | "secondary" | "ghost" | "danger";
		[rest: string]: any;
	};

	type ButtonProps = CommonProps &
		(
			| {
					withAction: true;
					action: string;
					onsubmit?: (e: Event) => void;
				}
			| {
					withAction?: false;
				}
		);

	const { text, withAction, action, onsubmit, type, variant = "primary", class: cls, ...rest }: ButtonProps = $props();

	const classes = ["button"];
	if (variant === "secondary") classes.push("secondary");
	if (variant === "ghost") classes.push("ghost");
	if (variant === "danger") classes.push("danger");
	if (cls) classes.push(cls as string);
</script>

{#if withAction}
	<form method="POST" {action} {onsubmit} class="inline-form" aria-hidden={false}>
		<button type={type ?? "submit"} class={classes.join(" ")} {...rest}>{text}</button>
	</form>
{:else}
	<button type={type ?? "button"} class={classes.join(" ")} {...rest}>{text}</button>
{/if}
