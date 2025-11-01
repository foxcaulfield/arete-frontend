<script lang="ts">
	import Button from "$lib/components/Button.svelte";
	import type { Snippet } from "svelte";

	interface Props {
		imageUrl?: string | null;
		audioUrl?: string | null;
		onImageChange?: (file: File | null, src: string | null) => void;
		onAudioChange?: (file: File | null, src: string | null) => void;
	}

	let {
		imageUrl = null,
		audioUrl = null,
		onImageChange,
		onAudioChange,
	}: Props = $props();

	type MediaStatus = "new" | "current" | "unchanged";

	// Image state
	let imagePreview = $state("");
	let imageFileName = $state("");
	let imageStatus = $state<MediaStatus>("unchanged");
	let showImagePreview = $state(false);

	// Audio state
	let audioPreview = $state("");
	let audioFileName = $state("");
	let audioStatus = $state<MediaStatus>("unchanged");
	let showAudioPreview = $state(false);

	// Initialize from props on mount
	$effect(() => {
		if (imageUrl) {
			imagePreview = `/api/files?type=image&name=${imageUrl}`;
			imageFileName = imageUrl;
			imageStatus = "current";
			showImagePreview = true;
		} else {
			resetImage();
		}

		if (audioUrl) {
			audioPreview = `/api/files?type=audio&name=${audioUrl}`;
			audioFileName = audioUrl;
			audioStatus = "current";
			showAudioPreview = true;
		} else {
			resetAudio();
		}
	});

	function handleImageFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			showImagePreview = true;
			imageFileName = file.name;
			imageStatus = "new";
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				imagePreview = reader.result as string;
			});
			reader.readAsDataURL(file);
			onImageChange?.(file, imagePreview);
		} else {
			resetImage();
			onImageChange?.(null, null);
		}
	}

	function handleAudioFileChange(event: Event) {
		const file = (event.target as HTMLInputElement).files?.[0];
		if (file) {
			showAudioPreview = true;
			audioFileName = file.name;
			audioStatus = "new";
			const reader = new FileReader();
			reader.addEventListener("load", function () {
				audioPreview = reader.result as string;
			});
			reader.readAsDataURL(file);
			onAudioChange?.(file, audioPreview);
		} else {
			resetAudio();
			onAudioChange?.(null, null);
		}
	}

	function resetImage() {
		imagePreview = "";
		showImagePreview = false;
		imageFileName = "";
		imageStatus = imageUrl ? "current" : "unchanged";
		const fileInput = document.querySelector("#media-image") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
	}

	function resetAudio() {
		audioPreview = "";
		showAudioPreview = false;
		audioFileName = "";
		audioStatus = audioUrl ? "current" : "unchanged";
		const fileInput = document.querySelector("#media-audio") as HTMLInputElement;
		if (fileInput) fileInput.value = "";
	}

	function clearImage() {
		resetImage();
		onImageChange?.(null, null);
	}

	function clearAudio() {
		resetAudio();
		onAudioChange?.(null, null);
	}
</script>

<div class="form-group">
	<label for="media-upload" class="label">Media Files</label>
	<p class="muted" style="font-size:0.875rem;margin-bottom:0.5rem">
		Enhance your question with images and audio
	</p>

	<div class="media-section" id="media-upload">
		<div class="file-input-wrapper">
			<label class="file-label" for="media-image">Upload Image</label>
			<input
				id="media-image"
				type="file"
				name="image"
				accept="image/*"
				onchange={handleImageFileChange}
				class="file-input"
				title="Image"
				autocomplete="off"
			/>
		</div>
		<div class="file-input-wrapper">
			<label class="file-label" for="media-audio">Upload Audio</label>
			<input
				id="media-audio"
				type="file"
				name="audio"
				accept="audio/*"
				onchange={handleAudioFileChange}
				class="file-input"
				autocomplete="off"
			/>
		</div>
	</div>

	<!-- Media Previews with Status Indicators -->
	<!-- {#if showImagePreview || showAudioPreview} -->
		<div class="preview-grid">
			{#if showImagePreview}
				<div class="preview-card">
					<div class="preview-header">
						<div class="preview-label">Image Preview</div>
						<div class="media-badge" class:status-new={imageStatus === "new"} class:status-current={imageStatus === "current"}>
							{imageStatus === "new" ? "⭐ New" : "✓ Current"}
						</div>
					</div>
					<div class="preview image-preview">
						<img src={imagePreview} alt="" />
					</div>
					{#if imageStatus !== "unchanged"}
						<div class="preview-actions">
							<Button text="Clear" type="button" variant="danger" appearance="outline" size="sm" onclick={clearImage} />
						</div>
					{/if}
				</div>
			{:else}
                <div class="preview-placeholder">No Image Uploaded</div>
            {/if}

			{#if showAudioPreview}
				<div class="preview-card">
					<div class="preview-header">
						<div class="preview-label">Audio Preview</div>
						<div class="media-badge" class:status-new={audioStatus === "new"} class:status-current={audioStatus === "current"}>
							{audioStatus === "new" ? "⭐ New" : "✓ Current"}
						</div>
					</div>
					<div class="preview audio-preview">
						<audio controls src={audioPreview}>
							<!-- fallback -->
						</audio>
					</div>
					{#if audioStatus !== "unchanged"}
						<div class="preview-actions">
							<Button text="Clear" type="button" variant="danger" appearance="outline" size="sm" onclick={clearAudio} />
						</div>
					{/if}
				</div>
			{:else}
                <div class="preview-placeholder">No Audio Uploaded</div>
            {/if}
		</div>
	<!-- {/if} -->
</div>

<style>
	.file-input {
		display: none;
	}

	.file-label {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		border: 2px dashed #d1d5db;
		border-radius: 10px;
		cursor: pointer;
		transition: all 0.2s ease;
		gap: 0.5rem;
		height: 1em;
	}

	.file-label:hover {
		border-color: #0066cc;
		background: #f0f6ff1a;
	}

	.file-label:active {
		transform: scale(0.98);
	}

	/* Preview Section */
	.preview-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.5rem;
		margin-top: 1rem;
	}

	@media (max-width: 768px) {
		.preview-grid {
			grid-template-columns: 1fr;
		}
	}

	.preview-card {
		border-radius: 12px;
		overflow: hidden;
		background: white;
		border: 1.5px solid #e5e7eb;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
	}

	.preview-card:hover {
		border-color: #d1d5db;
		box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
	}

	.preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		border-bottom: 1px solid #d1d5db;
	}

	.preview-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #374151;
	}

	.media-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.25rem 0.6rem;
		border-radius: 6px;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.5px;
	}

	.media-badge.status-new {
		background: #fef08a;
		color: #854d0e;
		border: 1px solid #facc15;
	}

	.media-badge.status-current {
		background: #dcfce7;
		color: #166534;
		border: 1px solid #86efac;
	}

	.preview {
		width: 100%;
		min-height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: white;
		overflow: hidden;
		flex-grow: 1;
	}

	.image-preview img {
		width: 100%;
		height: 100%;
		object-fit: contain;
		padding: 1rem;
	}

	.audio-preview {
		padding: 1.5rem;
	}

	.audio-preview audio {
		width: 100%;
		accent-color: #0066cc;
	}

	.preview-actions {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		border-top: 1px solid #e5e7eb;
		background: #f9fafb;
	}

	.media-section {
		/* 2 columns for media uploads */
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1.25rem;
	}
</style>
