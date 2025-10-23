<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	// import "@picocss/pico/css/pico.css";
	import "$lib/styles/global.css";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import type { LayoutProps } from "./$types";
	
	const { children }: LayoutProps = $props();
	
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<nav>
	<ul></ul>
	<ul>
		<li><a href="/">Home</a></li>
		<li><a href="/profile">Profile </a></li>
		<li><a href="/collections">Collections</a></li>
		<li><a href="/auth">Login (Register)</a></li>
	</ul>
</nav>

<main>
    <SvelteToast />
    {@render children?.()}
</main>

<style>
    :global(main) {
        flex: 1;
    }

    :global(body) {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
    }
</style>