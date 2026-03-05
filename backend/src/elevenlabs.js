import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, "cache");

// Ensure cache directory exists
if (!fs.existsSync(CACHE_DIR)) {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
}

/**
 * ElevenLabs Text-to-Speech API client with caching
 */
export class ElevenLabsClient {
	constructor(apiKey) {
		if (!apiKey) {
			throw new Error("ElevenLabs API key is required");
		}
		this.apiKey = apiKey;
		this.baseUrl = "https://api.elevenlabs.io/v1";
	}

	/**
	 * Generate speech from text
	 * @param {string} text - Text to convert to speech
	 * @param {string} voiceId - ElevenLabs voice ID
	 * @param {object} options - Additional options (model_id, voice_settings, etc.)
	 * @returns {Promise<Buffer>} Audio data
	 */
	async generateSpeech(text, voiceId, options = {}) {
		const cacheFilePath = this.getCacheFilePath(text, voiceId);

		// Check cache first
		if (this.isCached(cacheFilePath)) {
			console.log(
				`[Cache HIT] "${text.substring(0, 30)}..." (${voiceId})`,
			);
			return fs.readFileSync(cacheFilePath);
		}

		console.log(
			`[API CALL] "${text.substring(0, 30)}..." (${voiceId})`,
		);

		try {
			const response = await axios.post(
				`${this.baseUrl}/text-to-speech/${voiceId}`,
				{
					text,
					model_id:
						options.model_id ||
						"eleven_multilingual_v2",
					voice_settings:
						options.voice_settings || {
							stability: 0.5,
							similarity_boost: 0.75,
						},
				},
				{
					headers: {
						"xi-api-key": this.apiKey,
					},
					responseType: "arraybuffer",
				},
			);

			const audioBuffer = Buffer.from(response.data);

			// Cache the result
			this.cacheAudio(cacheFilePath, audioBuffer);

			return audioBuffer;
		} catch (error) {
			const status = error.response?.status;
			let errorMessage = error.message;
			// Parse arraybuffer error response
			if (error.response?.data) {
				try {
					const parsed = JSON.parse(
						Buffer.from(
							error.response.data,
						).toString(),
					);
					errorMessage =
						parsed?.detail?.message ||
						parsed?.detail ||
						errorMessage;
				} catch {
					// ignore parse errors
				}
			}
			console.error(
				`ElevenLabs API Error (${status || "unknown"}): ${errorMessage}`,
			);
			const err = new Error(
				`Failed to generate speech: ${errorMessage}`,
			);
			err.statusCode = status;
			throw err;
		}
	}

	/**
	 * Get list of available voices
	 * @returns {Promise<Array>} List of voices
	 */
	async getVoices() {
		try {
			const response = await axios.get(
				`${this.baseUrl}/voices`,
				{
					headers: {
						"xi-api-key": this.apiKey,
					},
				},
			);
			return response.data.voices;
		} catch (error) {
			console.error("Failed to fetch voices:", error.message);
			throw error;
		}
	}

	/**
	 * Generate cache file path based on text and voice
	 * @private
	 */
	getCacheFilePath(text, voiceId) {
		// Create a hash-like filename from text and voice
		const textHash = Buffer.from(text)
			.toString("base64")
			.substring(0, 16);
		return path.join(CACHE_DIR, `${voiceId}_${textHash}.mp3`);
	}

	/**
	 * Check if audio is cached and not expired
	 * @private
	 */
	isCached(filePath) {
		if (!fs.existsSync(filePath)) {
			return false;
		}

		// Cache expires after 7 days
		const stats = fs.statSync(filePath);
		const ageInDays =
			(Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
		return ageInDays < 7;
	}

	/**
	 * Cache audio file
	 * @private
	 */
	cacheAudio(filePath, audioBuffer) {
		try {
			fs.writeFileSync(filePath, audioBuffer);
			console.log(`[Cache SAVED] ${path.basename(filePath)}`);
		} catch (error) {
			console.error("Failed to cache audio:", error.message);
		}
	}

	/**
	 * Clear all cached audio files
	 */
	clearCache() {
		try {
			const files = fs.readdirSync(CACHE_DIR);
			files.forEach((file) => {
				fs.unlinkSync(path.join(CACHE_DIR, file));
			});
			console.log(`✓ Cleared ${files.length} cached files`);
		} catch (error) {
			console.error("Failed to clear cache:", error.message);
		}
	}

	/**
	 * Get cache statistics
	 */
	getCacheStats() {
		try {
			const files = fs.readdirSync(CACHE_DIR);
			let totalSize = 0;
			files.forEach((file) => {
				const filePath = path.join(CACHE_DIR, file);
				const stats = fs.statSync(filePath);
				totalSize += stats.size;
			});
			return {
				cachedFiles: files.length,
				totalSizeBytes: totalSize,
				totalSizeMB: (totalSize / 1024 / 1024).toFixed(
					2,
				),
			};
		} catch (error) {
			return { error: error.message };
		}
	}
}
