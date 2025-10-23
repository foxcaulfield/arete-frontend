<script lang="ts">
	// import type { PageProps } from "./$types";

	let { message = "Please sign in to continue." }: { message?: string } = $props();
</script>

<p>{message}</p>
