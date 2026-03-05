import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SAVES_DIR = path.join(__dirname, "../saves");

// Ensure saves directory exists
if (!fs.existsSync(SAVES_DIR)) {
	fs.mkdirSync(SAVES_DIR, { recursive: true });
}

/**
 * POST /api/save/game
 * Save game state
 */
router.post("/game", (req, res) => {
	try {
		const { saveSlot, gameState } = req.body;

		if (!saveSlot || typeof saveSlot !== "string") {
			return res
				.status(400)
				.json({
					error: "saveSlot is required and must be a string",
				});
		}

		if (!gameState || typeof gameState !== "object") {
			return res
				.status(400)
				.json({
					error: "gameState is required and must be an object",
				});
		}

		// Sanitize filename
		const safeSaveSlot = saveSlot.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filePath = path.join(SAVES_DIR, `${safeSaveSlot}.json`);

		const saveData = {
			saveSlot,
			gameState,
			timestamp: new Date().toISOString(),
		};

		fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2));
		console.log(`✓ Game saved: ${safeSaveSlot}`);

		res.json({
			message: "Game saved successfully",
			saveSlot,
			timestamp: saveData.timestamp,
		});
	} catch (error) {
		console.error("Save game error:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * GET /api/save/game/:saveSlot
 * Load game state
 */
router.get("/game/:saveSlot", (req, res) => {
	try {
		const { saveSlot } = req.params;

		// Sanitize filename
		const safeSaveSlot = saveSlot.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filePath = path.join(SAVES_DIR, `${safeSaveSlot}.json`);

		if (!fs.existsSync(filePath)) {
			return res
				.status(404)
				.json({ error: "Save file not found" });
		}

		const saveData = JSON.parse(fs.readFileSync(filePath, "utf8"));
		res.json(saveData);
	} catch (error) {
		console.error("Load game error:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * GET /api/save/list
 * List all save slots
 */
router.get("/list", (req, res) => {
	try {
		const files = fs
			.readdirSync(SAVES_DIR)
			.filter((f) => f.endsWith(".json"));
		const saves = files.map((file) => {
			const filePath = path.join(SAVES_DIR, file);
			const data = JSON.parse(
				fs.readFileSync(filePath, "utf8"),
			);
			return {
				saveSlot: data.saveSlot,
				timestamp: data.timestamp,
				playerName:
					data.gameState?.player?.name ||
					"Unknown",
				level: data.gameState?.player?.money || 0,
			};
		});

		res.json({ saves });
	} catch (error) {
		console.error("List saves error:", error);
		res.status(500).json({ error: error.message });
	}
});

/**
 * DELETE /api/save/game/:saveSlot
 * Delete a save file
 */
router.delete("/game/:saveSlot", (req, res) => {
	try {
		const { saveSlot } = req.params;

		// Sanitize filename
		const safeSaveSlot = saveSlot.replace(/[^a-zA-Z0-9_-]/g, "_");
		const filePath = path.join(SAVES_DIR, `${safeSaveSlot}.json`);

		if (!fs.existsSync(filePath)) {
			return res
				.status(404)
				.json({ error: "Save file not found" });
		}

		fs.unlinkSync(filePath);
		console.log(`✓ Save deleted: ${safeSaveSlot}`);

		res.json({
			message: "Save file deleted successfully",
			saveSlot,
		});
	} catch (error) {
		console.error("Delete save error:", error);
		res.status(500).json({ error: error.message });
	}
});

export default router;
