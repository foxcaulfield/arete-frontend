<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  // Client-side redirect to root. replaceState avoids adding history entry.
  onMount(() => {
    goto('/', { replaceState: true });
  });
</script>

<svelte:head>
  <!-- Fallback for users with JS disabled -->
  <meta http-equiv="refresh" content="0;url=/" />
</svelte:head>

<main class="redirect">
  <p>Redirecting to <a href="/">home</a></p>
</main>

<style>
  .redirect {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 40vh;
    color: var(--text, #e6eef8);
  }
  a { color: #7ee7c7; }
</style>
