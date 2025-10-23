<script lang="ts">
	// import type { PageProps } from "./$types";

	let { message = "Page not found." }: { message?: string } = $props();
</script>

<p>{message}</p>
