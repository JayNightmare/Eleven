/**
 * Voice Manager - Handles voice generation and audio playback
 */
export default class VoiceManager {
	constructor(apiBaseUrl = "http://localhost:3000") {
		this.apiBaseUrl = apiBaseUrl;
		this.currentAudio = null;
		this.isPlaying = false;
		this.queue = [];
		this.onPlayCallback = null;
		this.onEndCallback = null;
		this.onErrorCallback = null;
	}

	/**
	 * Generate and play voice for text
	 */
	async speak(text, voiceId = "21m00Tcm4TlvDq8ikWAM") {
		try {
			// Stop current audio if playing
			this.stop();

			// Show loading state
			if (this.onPlayCallback) {
				this.onPlayCallback({
					text,
					status: "loading",
				});
			}

			// Generate voice
			const response = await fetch(
				`${this.apiBaseUrl}/api/voice/generate`,
				{
					method: "POST",
					headers: {
						"Content-Type":
							"application/json",
					},
					body: JSON.stringify({
						text: text,
						voiceId: voiceId,
					}),
				},
			);

			if (!response.ok) {
				throw new Error(
					`Voice generation failed: ${response.status}`,
				);
			}

			// Get audio data
			const audioBlob = await response.blob();
			const audioUrl = URL.createObjectURL(audioBlob);

			// Create audio element
			this.currentAudio = new Audio(audioUrl);
			this.isPlaying = true;

			// Set up event listeners
			this.currentAudio.onplay = () => {
				if (this.onPlayCallback) {
					this.onPlayCallback({
						text,
						status: "playing",
					});
				}
			};

			this.currentAudio.onended = () => {
				this.isPlaying = false;
				URL.revokeObjectURL(audioUrl);

				if (this.onEndCallback) {
					this.onEndCallback({ text });
				}

				// Play next in queue if exists
				if (this.queue.length > 0) {
					const next = this.queue.shift();
					this.speak(next.text, next.voiceId);
				}
			};

			this.currentAudio.onerror = (error) => {
				this.isPlaying = false;
				console.error("Audio playback error:", error);

				if (this.onErrorCallback) {
					this.onErrorCallback({ text, error });
				}
			};

			// Play audio
			await this.currentAudio.play();

			return {
				success: true,
				duration: this.currentAudio.duration,
			};
		} catch (error) {
			console.error("Voice generation error:", error);
			this.isPlaying = false;

			if (this.onErrorCallback) {
				this.onErrorCallback({ text, error });
			}

			return {
				success: false,
				error: error.message,
			};
		}
	}

	/**
	 * Queue voice for playback after current finishes
	 */
	queue(text, voiceId) {
		this.queue.push({ text, voiceId });
	}

	/**
	 * Stop current audio playback
	 */
	stop() {
		if (this.currentAudio) {
			this.currentAudio.pause();
			this.currentAudio.currentTime = 0;
			this.currentAudio = null;
		}
		this.isPlaying = false;
	}

	/**
	 * Clear queue
	 */
	clearQueue() {
		this.queue = [];
	}

	/**
	 * Pause current audio
	 */
	pause() {
		if (this.currentAudio && this.isPlaying) {
			this.currentAudio.pause();
			this.isPlaying = false;
		}
	}

	/**
	 * Resume paused audio
	 */
	resume() {
		if (this.currentAudio && !this.isPlaying) {
			this.currentAudio.play();
			this.isPlaying = true;
		}
	}

	/**
	 * Set volume (0.0 to 1.0)
	 */
	setVolume(volume) {
		if (this.currentAudio) {
			this.currentAudio.volume = Math.max(
				0,
				Math.min(1, volume),
			);
		}
	}

	/**
	 * Get current playback state
	 */
	getState() {
		return {
			isPlaying: this.isPlaying,
			queueLength: this.queue.length,
			currentTime: this.currentAudio?.currentTime || 0,
			duration: this.currentAudio?.duration || 0,
		};
	}

	/**
	 * Set callback for play event
	 */
	onPlay(callback) {
		this.onPlayCallback = callback;
	}

	/**
	 * Set callback for end event
	 */
	onEnd(callback) {
		this.onEndCallback = callback;
	}

	/**
	 * Set callback for error event
	 */
	onError(callback) {
		this.onErrorCallback = callback;
	}

	/**
	 * Test voice generation and playback
	 */
	async test(voiceId = "21m00Tcm4TlvDq8ikWAM") {
		const testText =
			"Hello! This is a test of the voice system. If you can hear this, everything is working correctly!";
		console.log("Testing voice with ID:", voiceId);
		return await this.speak(testText, voiceId);
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		this.stop();
		this.clearQueue();
		this.onPlayCallback = null;
		this.onEndCallback = null;
		this.onErrorCallback = null;
	}
}
