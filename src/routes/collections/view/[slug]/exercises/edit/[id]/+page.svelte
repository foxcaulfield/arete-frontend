<script lang="ts">
	import { page } from "$app/state";
	import { goto } from "$app/navigation";
	import { toast } from "@zerodevx/svelte-toast";
	import type { PageProps } from "./$types";
	import Button from "$lib/components/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import { enhance } from "$app/forms";

	const props: PageProps = $props();

	const exercise = $derived(props.data.exercise);

	const formErrors = $derived(props.form?.errors || {});
	const generalFormError = $derived(props.form?.errorText || "");

	let additionalCorrectAnswers = $state<Array<{ id: number; value: string }>>([]);
	let distractors = $state<Array<{ id: number; value: string }>>([]);

	const randomId = () => Math.floor(Math.random() * 1_000_000);

	function addAdditionalAnswer() {
		additionalCorrectAnswers.push({ id: randomId(), value: "" });
	}

	function removeAdditionalAnswer(idx: number) {
		additionalCorrectAnswers = additionalCorrectAnswers.filter((answer) => answer.id !== idx);
	}

	function addDistractor() {
		distractors.push({ id: randomId(), value: "" });
	}

	function removeDistractor(idx: number) {
		distractors = distractors.filter((distractor) => distractor.id !== idx);
	}

	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, {});
		}
	});

	$effect(() => {
		if (exercise) {
			additionalCorrectAnswers = (exercise.additionalCorrectAnswers || []).map((ans) => ({
				id: randomId(),
				value: ans
			}));
			distractors = (exercise.distractors || []).map((dist) => ({
				id: randomId(),
				value: dist
			}));
		}
	});

	async function handleGoBackToCollection() {
		await goto(`/collections/view/${exercise?.collectionId}`, { replaceState: true });
	}

	
</script>

<div class="container">
	<div class="card-lg">
		<h1>Editing Exercise</h1>
		<!-- <p class="muted" style="margin-top:.4rem">
			Compose a question, answers and optional media. Use the add buttons to provide alternatives.
		</p> -->
	</div>

	<!-- with preserved place, omit jumping -->
	<div class="field-error" style="margin-top:1rem; min-height:1.5rem">
		{#if generalFormError}
			{generalFormError}
		{/if}
	</div>
	<form
		action="?/update"
		method="POST"
		enctype="multipart/form-data"
		class="card form-card"
		style="margin-top:1rem"
		use:enhance
	>
		<div class="form-grid">
			<div class="form-group">
				<label for="type" class="label">Choose type</label>
				<select id="type" name="type" value={exercise?.type}>>
					{#each ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"] as Exercise.ExerciseType[] as type}
						<option value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>
					{/each}
				</select>
				{#if formErrors?.type}
					<span class="field-error">{formErrors.type}</span>
				{/if}
			</div>

			<!-- idName="question" -->
			<TextInput
				errors={formErrors?.question}
				value={exercise?.question}
				name="question"
				label="Question *"
				placeholder="Enter the question"
				minMax={[5, 300]}
				aria-describedby="question-error"
			/>

			<!-- <FormGroupTextInput -->
			<TextInput
				errors={formErrors?.correctAnswer}
				value={exercise?.correctAnswer || undefined}
				name="correctAnswer"
				label="Correct answer *"
				placeholder="Enter the correct answer"
				minMax={[1, 50]}
			/>

			<div class="two-columns">
				<div class="form-group">
					<!-- <label class="label">Additional Correct Answers (optional)</label> -->
					<div style="display:flex;gap:.6rem;align-items:center;margin-top:.35rem">
						<Button
							text="Add Another Answer"
							type="button"
							variant="secondary"
							onclick={addAdditionalAnswer}
						/>
					</div>
					<!-- In your template, change the each block: -->
					{#each additionalCorrectAnswers as answer (answer.id)}
						<div class="alt-answer-row">
							<TextInput
								errors={formErrors?.additionalCorrectAnswers}
								name="additionalCorrectAnswers"
								value={answer.value}
								placeholder="Additional correct answer"
							/>
							<Button
								text="Remove"
								type="button"
								appearance="ghost"
								onclick={() => removeAdditionalAnswer(answer.id)}
							/>
						</div>
					{/each}
				</div>

				<!-- <label class="label">Distractors (optional)</label> -->
				<div class="form-group">
					<div style="display:flex;gap:.6rem;align-items:center;margin-top:.35rem">
						<Button text="Add Distractor" type="button" variant="secondary" onclick={addDistractor} />
					</div>
					{#each distractors as distractor (distractor.id)}
						<div class="alt-answer-row">
							<TextInput
								errors={formErrors?.distractors}
								name="distractors"
								value={distractor.value}
								placeholder="Distractor answer"
							/>
							<Button
								text="Remove"
								type="button"
								appearance="ghost"
								onclick={() => removeDistractor(distractor.id)}
							/>
						</div>
					{/each}
				</div>
			</div>

			<div class="two-columns">
				<div class="form-group">
					<label for="explanation" class="label">Explanation (optional)</label>
					<textarea
						style="display:block;width:100%;height:80px;"
						name="explanation"
						placeholder="Explain the answer"
						required={false}
						value={exercise?.explanation}
					></textarea>
					{#if formErrors?.explanation}
						<span class="field-error">{formErrors.explanation}</span>
					{/if}
				</div>

				<div class="form-group">
					<label class="label" for="">Media (optional)</label>
					<!-- <div class="file-row"> -->
					<div>
						<!-- <label for="image" class="muted">Image</label> -->
						<input type="file" name="image" accept="image/*" />
					</div>
					<div>
						<!-- <label for="audio" class="muted">Audio</label> -->
						<input type="file" name="audio" accept="audio/*" />
					</div>
					<!-- </div> -->
				</div>
			</div>
		</div>

		<div class="form-actions">
			<Button text="Update Exercise" type="submit" />
			<Button text="Cancel" type="button" variant="secondary" onclick={handleGoBackToCollection} />
		</div>
	</form>
</div>
