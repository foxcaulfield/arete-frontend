<script lang="ts">
	type CommonProps = {
		text: string;
        type?: "button" | "submit" | "reset";
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
	const { text, withAction, action, onsubmit, type, ...rest }: ButtonProps = $props();
</script>

{#if withAction}
	<form method="POST" {action} {onsubmit} style:display="inline" >
		<button type={type ?? "submit"} {...rest}>{text}</button>
	</form>
{:else}
	<button type={type ?? "button"} {...rest}>{text}</button>
{/if}
