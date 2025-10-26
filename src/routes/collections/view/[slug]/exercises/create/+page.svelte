<script lang="ts">
	import { goto } from "$app/navigation";
	// import { page } from "$app/state";
	import { toast } from "@zerodevx/svelte-toast";
	import type { PageProps } from "./$types";
	import Button from "$lib/components/Button.svelte";
	import TextInput from "$lib/components/TextInput.svelte";
	import FormGroupTextarea from "$lib/components/FormGroupTextarea.svelte";
	import FormGroupTextInput from "$lib/components/FormGroupTextInput.svelte";

	const props: PageProps = $props();

	let collectionId = $derived(props.data.collectionId);
	let formValues = $derived(props.form?.values);
	let additionalCorrectAnswers = $derived(formValues?.additionalCorrectAnswers || []);
	let distractors = $derived(formValues?.distractors || []);
	let fieldErrors = $derived(props.form?.errors);

	// let tagInput = $state("");

	// Handle server action response
	$effect(() => {
		if (props.form?.errorText) {
			toast.push(props.form.errorText, {});
		}

		// if (props.form?.errors) {
		// 	fieldErrors = props.form.errors;
		// }
	});

	function goBack() {
		goto(`/collections/view/${collectionId}`);
	}

	function addDistractor() {
		distractors = [...distractors, ""];
	}

	function removeDistractor(index: number) {
		distractors.splice(index, 1);
		distractors = [...distractors];
	}

	function addAdditionalAnswer() {
		additionalCorrectAnswers = [...additionalCorrectAnswers, ""];
	}

	function removeAdditionalAnswer(index: number) {
		additionalCorrectAnswers.splice(index, 1);
		additionalCorrectAnswers = [...additionalCorrectAnswers];
	}
</script>

<div class="container">
	<div class="card-lg">
		<h1>Create New Exercise</h1>
			<p class="muted" style="margin-top:.4rem">
				Compose a question, answers and optional media. Use the add buttons to provide alternatives.
			</p>
	</div>

	<form action="?/create" method="POST" enctype="multipart/form-data" class="card form-card" style="margin-top:1rem">
		<div class="form-grid">
			<div class="form-group">
				<label for="exercise-type" class="label">Choose type</label>
				<select id="exercise-type" name="exercise-type" value={props.form?.values?.type || "FILL_IN_THE_BLANK"}>
					{#each ["FILL_IN_THE_BLANK", "CHOICE_SINGLE"] as ExerciseType[] as type}
						<option value={type}>{type.replaceAll("_", " ").toLowerCase()}</option>
					{/each}
				</select>
			</div>

			<FormGroupTextInput
				idName="question"
				label="Question *"
				placeholder="Enter the question"
				value={props.form?.values?.question || ""}
				minMax={[5, 300]}
				errorText={fieldErrors?.question}
			/>

			<FormGroupTextInput
				idName="correctAnswer"
				label="Correct answer *"
				placeholder="Enter the correct answer"
				value={props.form?.values?.correctAnswer || ""}
				minMax={[1, 50]}
				errorText={fieldErrors?.correctAnswer}
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
					{#each additionalCorrectAnswers as answer, idx (idx)}
						<div class="alt-answer-row">
							<TextInput
								name="additionalCorrectAnswers"
								value={answer}
								placeholder="Additional correct answer"
							/>
							<Button
								text="Remove"
								type="button"
								variant="ghost"
								onclick={() => removeAdditionalAnswer(idx)}
							/>
						</div>
					{/each}
					{#if fieldErrors?.additionalCorrectAnswers}
						<span class="field-error">{fieldErrors.additionalCorrectAnswers}</span>
					{/if}
				</div>

				<div class="form-group">
					<!-- <label class="label">Distractors (optional)</label> -->
					<div style="display:flex;gap:.6rem;align-items:center;margin-top:.35rem">
						<Button text="Add Distractor" type="button" variant="secondary" onclick={addDistractor} />
					</div>
					{#each distractors as distractor, idx (idx)}
						<div class="alt-answer-row">
							<TextInput name="distractors" value={distractor} placeholder="Distractor answer" />
							<Button text="Remove" type="button" variant="ghost" onclick={() => removeDistractor(idx)} />
						</div>
					{/each}
					{#if fieldErrors?.distractors}
						<span class="field-error">{fieldErrors.distractors}</span>
					{/if}
				</div>
			</div>

			<div class="two-columns">
				<FormGroupTextarea
					idName="explanation"
					label="Explanation (optional)"
					placeholder="Explain the answer"
					value={props.form?.values?.explanation || ""}
					minMax={[0, 1000]}
					errorText={fieldErrors?.explanation}
					required={false}
				/>
				<div class="form-group">
					<label class="label">Media (optional)</label>
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
			<Button text="Create Exercise" type="submit" />
			<Button text="Cancel" type="button" variant="secondary" onclick={goBack} />
		</div>
	</form>
</div>
