<script lang="ts">
	type CommonProps = {
		text: string;
		type?: "button" | "submit" | "reset";
		variant?: "primary" | "secondary" | "ghost" | "danger";
		buttonElement?: HTMLButtonElement | undefined;
		class?: string;
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
</script>

{#if withAction}
	<form method="POST" {action} {onsubmit} class="inline-form" aria-hidden={false}>
		<button bind:this={buttonElement} type={type ?? "submit"} class={`button ${variant} ${cls}`} {...rest}
			>{text}</button
		>
	</form>
{:else}
	<button bind:this={buttonElement} type={type ?? "button"} class={`button ${variant} ${cls}`} {...rest}
		>{text}</button
	>
{/if}
