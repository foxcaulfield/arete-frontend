<script lang="ts">
	type CommonProps = {
		text: string;
		type?: "button" | "submit" | "reset";
		variant?: "primary" | "secondary" | "ghost" | "danger";
		buttonElement?: HTMLButtonElement | undefined;
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
		class: cls,
		...rest
	}: ButtonProps = $props();
	const classes = ["button"];
	
	if (variant === "secondary") classes.push("secondary");
	if (variant === "ghost") classes.push("ghost");
	if (variant === "danger") classes.push("danger");
	if (cls) classes.push(cls as string);
</script>

{#if withAction}
	<form method="POST" {action} {onsubmit} class="inline-form" aria-hidden={false}>
		<button bind:this={buttonElement} type={type ?? "submit"} class={classes.join(" ")} {...rest}>{text}</button>
	</form>
{:else}
	<button bind:this={buttonElement} type={type ?? "button"} class={classes.join(" ")} {...rest}>{text}</button>
{/if}
