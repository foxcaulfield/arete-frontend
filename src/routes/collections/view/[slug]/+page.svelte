<script lang="ts">
	import { toast } from "@zerodevx/svelte-toast";

	import { onMount } from "svelte";
	import { page } from "$app/state";
	import { goto } from "$app/navigation";

	import Forbidden from "$lib/components/Forbidden.svelte";
	import NotFound from "$lib/components/NotFound.svelte";
	import Unauthorized from "$lib/components/Unauthorized.svelte";

	import type { PageProps } from "./$types";
	import ExercisesTable from "$lib/components/exercises/ExercisesTable.svelte";
	import Button from "$lib/components/common/Button.svelte";
	import { Pagination } from "@skeletonlabs/skeleton-svelte";
	import { Dialog, Portal } from "@skeletonlabs/skeleton-svelte";
	let props: PageProps = $props();

	let serverData = $derived(props.data?.serverData || {});
	let paginatedExercises = $derived(serverData.paginatedExercises);
	let pagination = $derived(paginatedExercises?.pagination);

	let currentCollection = $derived(serverData.collection);
	let flags = $derived(props.data?.flags || {});
	let userName = $derived(currentCollection?.user?.name || "Unnamed User");
	let userId = $derived(currentCollection?.user?.id || "Unknown ID");
	let hasExercises = $derived(Boolean(paginatedExercises && paginatedExercises?.data?.length > 0));

	let hasNextPage = $derived(Boolean(pagination?.hasNextPage));
	let hasPreviousPage = $derived(Boolean(pagination?.hasPreviousPage));

	let totalPages = $derived(pagination?.totalPages ?? 0);
	let totalItems = $derived(pagination?.totalItems ?? 0);

	const searchParams = $derived(page.url.searchParams);
	let currentPage = $derived(parseInt(searchParams.get("page") ?? pagination?.page?.toString() ?? "1", 10));
	let limit = $derived(searchParams.get("limit") ?? pagination?.limit?.toString() ?? "5");

	async function goToPage(newPage: number) {
		const params = new URLSearchParams(page.url.search);
		params.set("page", Math.max(1, newPage).toString());
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
		// No invalidateAll needed; navigation re-runs [+page.server.ts]
	}

	function confirmDelete(e: Event) {
		// if (!confirm("Delete this collection? This cannot be undone.")) {
		// 	e.preventDefault();
		// }
	}

	function backToCollections() {
		const qs = page.url.search;
		goto(`/collections${qs || ""}`, { noScroll: true });
	}

	function goToEditCollection() {
		const qs = page.url.search;
		goto(`/collections/edit/${currentCollection?.id}${qs || ""}`, { noScroll: true });
	}

	function goToCreateExercise() {
		const qs = page.url.search;
		goto(`/collections/view/${currentCollection?.id}/exercises/create${qs || ""}`, {
			noScroll: true,
		});
	}

	function goToQuiz() {
		const qs = page.url.search;
		goto(`/collections/view/${currentCollection?.id}/exercises/quiz${qs || ""}`, {
			noScroll: true,
		});
	}

	async function handleLimitChange(e: Event) {
		const newLimit = parseInt((e.currentTarget as HTMLSelectElement).value, 10) || 10;
		const params = new URLSearchParams(page.url.search);
		params.set("limit", newLimit.toString());
		params.set("page", "1");
		await goto(`?${params.toString()}`, { keepFocus: true, noScroll: true });
	}

	onMount(() => {
		const searchParams = new URLSearchParams(page.url.search);
		let changed = false;

		const isUpdated = searchParams.get("updated") === "1";
		const isCreated = searchParams.get("created") === "1";
		const isExerciseCreated = searchParams.get("exerciseCreated") === "1";
		const isExerciseUpdated = searchParams.get("exerciseUpdated") === "1";

		if (isUpdated) {
			toast.push("Collection updated successfully!");
			searchParams.delete("updated");
			changed = true;
		}

		if (isCreated) {
			toast.push("Collection created successfully!");
			searchParams.delete("created");
			changed = true;
		}

		if (isExerciseCreated) {
			toast.push("Exercise created successfully!");
			searchParams.delete("exerciseCreated");
			changed = true;
		}

		if (isExerciseUpdated) {
			toast.push("Exercise updated successfully!");
		}

		if (changed) {
			const queryString = searchParams.toString();
			goto(`${page.url.pathname}${queryString ? `?${queryString}` : ""}`, { replaceState: true, noScroll: true });
		}
	});
</script>

{#if flags?.unauthorized}
	<Unauthorized />
{:else if flags?.forbidden}
	<Forbidden />
{:else if flags?.notFound}
	<NotFound />
{:else}
	<div class="space-y-4 p-4">
		<!-- Main Header - Minimal -->
		<div class="flex items-start justify-between">
			<div class="min-w-0 flex-1">
				<h1 class="mb-0.5 truncate h3">{currentCollection?.name}</h1>
				<p class="line-clamp-2 text-xs opacity-60">{currentCollection?.description}</p>
			</div>
			<div class="flex shrink-0 gap-1"></div>
		</div>

		<!-- Two Column Layout -->
		<div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
			<!-- Left: Info Sidebar -->
			<div class="space-y-3 text-xs lg:col-span-1">
				<div class="space-y-3 card preset-filled-surface-100-900 p-3">
					<!-- Owner Block -->
					<div>
						<span class="mb-1 block font-medium opacity-60">Owner</span>
						<div class="rounded bg-black/10 p-2">
							<p class="font-medium">{userName}</p>
							<code class="block text-xs break-all opacity-75">{userId}</code>
						</div>
					</div>

					<!-- Dates Block -->
					<div>
						<span class="mb-1 block font-medium opacity-60">Timeline</span>
						<div class="space-y-1">
							<div class="rounded bg-black/10 p-2">
								<span class="text-xs opacity-75">Created</span>
								<time class="block font-mono text-xs">{currentCollection?.createdAt}</time>
							</div>
							<div class="rounded bg-black/10 p-2">
								<span class="text-xs opacity-75">Updated</span>
								<time class="block font-mono text-xs">{currentCollection?.updatedAt}</time>
							</div>
						</div>
					</div>

					<!-- ID Block -->
					<div>
						<span class="mb-1 block font-medium opacity-60">Collection ID</span>
						<code class="block rounded bg-black/10 p-2 text-xs break-all">{currentCollection?.id}</code>
					</div>
				</div>

				<!-- Quick Actions Card -->
				<div class="space-y-2 card preset-filled-surface-100-900 p-3">
					<span class="block text-xs font-medium opacity-60">Actions</span>
					<Button text="Create Exercise" onclick={goToCreateExercise} fullWidth={true} size="sm" />
					<Button text="Start Quiz" onclick={goToQuiz} color="secondary" fullWidth={true} size="sm" />
					<!-- <Button
						withAction={true}
						action="?/delete"
						onsubmit={confirmDelete}
						text="Delete Collection"
						color="error"
						fullWidth={true}
						size="sm"
					/> -->
					<Button text="Back" onclick={backToCollections} preset="tonal" size="sm" />
					<Button text="Edit" onclick={goToEditCollection} color="secondary" size="sm" />
					<Dialog>
						<Dialog.Trigger class="preset-ghost btn">Delete Collection</Dialog.Trigger>
						<Portal>
							<Dialog.Backdrop class="fixed inset-0 z-50 bg-surface-50-950/50" />
							<Dialog.Positioner class="fixed inset-0 z-50 flex items-center justify-center">
								<Dialog.Content class="w-md space-y-2 card bg-surface-100-900 p-4 shadow-xl">
									<header class="flex items-center justify-between">
										<Dialog.Title class="text-2xl font-bold">Delete this Collection?</Dialog.Title>
										<Dialog.CloseTrigger class="btn-icon hover:preset-tonal"
											>&times</Dialog.CloseTrigger
										>
									</header>
									<Dialog.Description>This action cannot be undone.</Dialog.Description>
									<Button
										withAction={true}
										action="?/delete"
										onsubmit={confirmDelete}
										text="Delete Collection"
										preset="filled"
										color="error"
										fullWidth={true}
										size="sm"
									/>
									<!-- <Dialog.CloseTrigger class="btn preset-tonal">Cancel</Dialog.CloseTrigger> -->
								</Dialog.Content>
							</Dialog.Positioner>
						</Portal>
					</Dialog>
				</div>
			</div>

			<!-- Right: Exercises Main Content -->
			<div class="lg:col-span-2">
				<div class="space-y-3 card preset-filled-surface-100-900 p-4">
					<div class="mb-2 flex items-center justify-between">
						<h2 class="text-base font-semibold">Exercises</h2>
						<span class="text-xs font-medium opacity-60">{totalItems} total</span>
					</div>

					<!-- Pagination Controls -->
					<!-- Controls Bar -->
					<div class="border-opacity-20 flex flex-col gap-3 border-b pb-3">
						<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div class="flex items-center gap-2">
								<label for="page-limit" class="text-xs font-medium opacity-60">Show</label>
								<select
									id="page-limit"
									class="select w-fit text-xs"
									value={String(limit)}
									onchange={handleLimitChange}
								>
									<option value="5">5</option>
									<option value="10">10</option>
									<option value="20">20</option>
								</select>
								<span class="text-xs opacity-60">per page</span>
							</div>
							{#if totalPages > 1}
								<div class="flex flex-wrap items-center justify-center gap-1">
									<Pagination
										count={totalItems}
										pageSize={Number(limit)}
										page={currentPage}
										onPageChange={(event) => goToPage(event.page)}
									>
										<Pagination.Context>
											{#snippet children(pagination)}
												{#each pagination().pages as page, index (page)}
													{#if page.type === "page"}
														<Pagination.Item {...page}>
															{page.value}
														</Pagination.Item>
													{:else}
														<Pagination.Ellipsis {index}>&#8230;</Pagination.Ellipsis>
													{/if}
												{/each}
											{/snippet}
										</Pagination.Context>
									</Pagination>
								</div>
							{/if}
							<div class="flex flex-col gap-2 sm:flex-row sm:items-center">
								<div class="flex items-center gap-2">
									<Button
										text="Previous"
										onclick={() => goToPage(currentPage - 1)}
										disabled={!hasPreviousPage}
										preset="tonal"
										size="sm"
									/>
									<span class="text-xs opacity-60">
										{#if totalItems > 0}
											{(currentPage - 1) * Number(limit) + 1}–{Math.min(
												currentPage * Number(limit),
												totalItems
											)} of {totalItems}
										{:else}
											No items
										{/if}
									</span>
									<Button
										text="Next"
										onclick={() => goToPage(currentPage + 1)}
										disabled={!hasNextPage}
										preset="tonal"
										size="sm"
									/>
								</div>

								<!-- <div class="text-xs opacity-60 sm:ml-2">
							Page <span class="font-medium">{currentPage}</span> of <span class="font-medium">{totalPages || 1}</span>
						</div> -->
							</div>
						</div>
					</div>

					<!-- Exercises Table or Empty State -->
					{#if paginatedExercises && hasExercises}
						<div class="overflow-x-auto">
							<ExercisesTable exercises={paginatedExercises.data} />
						</div>
					{:else}
						<div class="py-12 text-center opacity-40">
							<p class="mb-2 text-sm">No exercises yet</p>
							<p class="text-xs opacity-75">Create one from the Actions panel to get started</p>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
{/if}
