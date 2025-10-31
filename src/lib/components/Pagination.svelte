<script lang="ts">
	import Button from "$lib/components/Button.svelte";

	interface Props {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		hasNextPage: boolean;
		hasPreviousPage: boolean;
		limit: number;
		onPageChange: (page: number) => void;
		onLimitChange: (limit: number) => void;
		limitOptions?: number[];
		showPageInfo?: boolean;
		showLimitSelector?: boolean;
	}

	let {
		currentPage,
		totalPages,
		totalItems,
		hasNextPage,
		hasPreviousPage,
		limit,
		onPageChange,
		onLimitChange,
		limitOptions = [5, 10, 25, 50],
		showPageInfo = true,
		showLimitSelector = true,
	}: Props = $props();

	function handleNextPage() {
		if (hasNextPage) {
			onPageChange(currentPage + 1);
		}
	}

	function handlePreviousPage() {
		if (hasPreviousPage) {
			onPageChange(currentPage - 1);
		}
	}

	function handleLimitChange(e: Event) {
		const newLimit = parseInt((e.currentTarget as HTMLSelectElement).value, 10);
		if (newLimit && newLimit > 0) {
			onLimitChange(newLimit);
		}
	}

	// Calculate range of items being shown
	const itemRange = $derived(() => {
		if (totalItems === 0) return { start: 0, end: 0 };
		const start = (currentPage - 1) * limit + 1;
		const end = Math.min(currentPage * limit, totalItems);
		return { start, end };
	});
</script>

<div class="pagination-container">
	{#if showLimitSelector}
		<div class="limit-selector">
			<label for="page-limit" class="muted">Show</label>
			<select id="page-limit" value={limit} onchange={handleLimitChange}>
				{#each limitOptions as option}
					<option value={option}>{option} per page</option>
				{/each}
			</select>
		</div>
	{/if}

	<div class="pagination-controls">
		<Button text="Previous" onclick={handlePreviousPage} disabled={!hasPreviousPage} variant="secondary" />

		{#if showPageInfo}
			<div class="page-info">
				<span class="muted">
					{#if totalItems > 0}
						Showing {itemRange().start}–{itemRange().end} of {totalItems}
					{:else}
						No items
					{/if}
				</span>
				<span class="muted page-numbers">
					Page {currentPage} of {totalPages || 1}
				</span>
			</div>
		{/if}

		<Button text="Next" onclick={handleNextPage} disabled={!hasNextPage} variant="secondary" />
	</div>
</div>

<style>
	.pagination-container {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 1rem 0;
		flex-wrap: wrap;
	}

	.limit-selector {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.limit-selector label {
		font-size: 0.875rem;
	}

	.limit-selector select {
		min-width: 120px;
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-left: auto;
	}

	.page-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.25rem;
		min-width: 180px;
		text-align: center;
	}

	.page-info .muted {
		font-size: 0.875rem;
	}

	.page-numbers {
		font-weight: 500;
	}

	@media (max-width: 640px) {
		.pagination-container {
			flex-direction: column;
			align-items: stretch;
		}

		.limit-selector {
			justify-content: center;
		}

		.pagination-controls {
			margin-left: 0;
			justify-content: center;
		}

		.page-info {
			min-width: auto;
		}
	}
</style>
