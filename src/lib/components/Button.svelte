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

<style>
	/* button {
        padding: 0.5rem 1rem;
        background-color: #1e90ff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 1rem;
    }
    button:hover {
        background-color: #1c86ee;
    }
    button:active {
        background-color: #1874cd;
    }
    button:focus {
        outline: none;
        box-shadow: 0 0 0 3px rgba(30, 144, 255, 0.5);
    }
    button {
        transition: background-color 0.2s;
    } */
</style>
