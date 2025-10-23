<script lang="ts">
	import Forbidden from "$lib/components/Forbidden.svelte";
	import NotFound from "$lib/components/NotFound.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";

    let { flags = {}, children } = $props<{
        flags?: {
            unauthorized?: boolean;
            forbidden?: boolean;
            notFound?: boolean;
            errorText?: string;
        };
        children?: () => any;
    }>();
</script>

{#if flags.unauthorized}
	<Unauthorized message="Please sign in to continue." />
{:else if flags.forbidden}
	<Forbidden message="You don't have permission to view this page." />
{:else if flags.notFound}
	<NotFound message="The requested resource was not found." />
{:else}
	{@render children?.()}
{/if}
