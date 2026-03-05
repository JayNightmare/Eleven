import express from "express";
import { ElevenLabsClient } from "../elevenlabs.js";

const router = express.Router();

/**
 * POST /api/voice/generate
 * Generate speech from text
 */
router.post("/generate", async (req, res) => {
	try {
		const { text, voiceId, options } = req.body;

		// Validation
		if (
			!text ||
			typeof text !== "string" ||
			text.trim().length === 0
		) {
			return res.status(400).json({
				error: "text is required and must be a non-empty string",
			});
		}

		if (!voiceId || typeof voiceId !== "string") {
			return res.status(400).json({
				error: "voiceId is required and must be a string",
			});
		}

		if (text.length > 1000) {
			return res.status(400).json({
				error: "text must be 1000 characters or less",
			});
		}

		const apiKey = req.elevenLabsApiKey;
		if (!apiKey) {
			return res.status(503).json({
				error: "ElevenLabs API key not configured",
			});
		}

		// Generate speech
		const client = new ElevenLabsClient(apiKey);
		const audioBuffer = await client.generateSpeech(
			text,
			voiceId,
			options || {},
		);

		// Return audio file
		res.setHeader("Content-Type", "audio/mpeg");
		res.setHeader("Content-Length", audioBuffer.length);
		res.send(audioBuffer);
	} catch (error) {
		console.error("Voice generation error:", error.message);
		const status = error.statusCode === 401 ? 401 : 500;
		res.status(status).json({ error: error.message });
	}
});

/**
 * GET /api/voice/voices
 * List available voices
 */
router.get("/voices", async (req, res) => {
	try {
		const apiKey = req.elevenLabsApiKey;
		if (!apiKey) {
			return res.status(503).json({
				error: "ElevenLabs API key not configured",
			});
		}

		const client = new ElevenLabsClient(apiKey);
		const voices = await client.getVoices();
		res.json({ voices });
	} catch (error) {
		console.error("Voices fetch error:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * GET /api/voice/cache-stats
 * Get cache statistics
 */
router.get("/cache-stats", (req, res) => {
	try {
		const apiKey = req.elevenLabsApiKey;
		if (!apiKey) {
			return res.status(503).json({
				error: "ElevenLabs API key not configured",
			});
		}

		const client = new ElevenLabsClient(apiKey);
		const stats = client.getCacheStats();
		res.json({ cache: stats });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

/**
 * DELETE /api/voice/cache
 * Clear voice cache
 */
router.delete("/cache", (req, res) => {
	try {
		const apiKey = req.elevenLabsApiKey;
		if (!apiKey) {
			return res.status(503).json({
				error: "ElevenLabs API key not configured",
			});
		}

		const client = new ElevenLabsClient(apiKey);
		client.clearCache();
		res.json({ message: "Cache cleared successfully" });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

export default router;
