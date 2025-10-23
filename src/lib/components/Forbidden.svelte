<script lang="ts">
	// import type { PageProps } from "./$types";

	let { message = "Access denied." }: { message?: string } = $props();
</script>

<p>{message}</p>
