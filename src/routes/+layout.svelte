<script lang="ts">
	import favicon from "$lib/assets/favicon.svg";
	// import "@picocss/pico/css/pico.css";
	import "$lib/styles/global.scss";
	import "$lib/styles/app.css";
	import { SvelteToast } from "@zerodevx/svelte-toast";
	import type { LayoutProps } from "./$types";
	import { BikeIcon, BookIcon, HouseIcon, TreePalmIcon } from "@lucide/svelte";
	import { Navigation } from "@skeletonlabs/skeleton-svelte";

	const { children }: LayoutProps = $props();

	const links = [
		{ href: "/", text: "Home", icon: HouseIcon },
		{ href: "/profile", text: "Profile", icon: TreePalmIcon },
		{ href: "/collections", text: "Collections", icon: BookIcon },
		{ href: "/auth", text: "Auth", icon: BikeIcon },
	];

	let anchorBar = 'btn hover:preset-tonal flex-col items-center gap-1';
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Navigation layout="bar">
	<Navigation.Menu class="grid grid-cols-4 gap-2">
		{#each links as link (link)}
			{@const Icon = link.icon}
			<a href={link.href} class={anchorBar}>
				<Icon class="size-5" />
				<span class="text-[10px]">{link.text}</span>
			</a>
		{/each}
	</Navigation.Menu>
</Navigation>

<main>
	<SvelteToast />
	{@render children?.()}
</main>
