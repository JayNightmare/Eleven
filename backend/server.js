import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { initializeSecretManager } from "./src/secretManager.js";
import voiceRouter from "./src/routes/voice.js";
import saveGameRouter from "./src/routes/saveGame.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Secret Manager on startup
let elevenLabsApiKey = null;

async function startup() {
	try {
		console.log("Initializing Secret Manager...");
		elevenLabsApiKey = await initializeSecretManager();
		console.log("✓ Secret Manager initialized successfully");
	} catch (error) {
		console.error(
			"✗ Failed to initialize Secret Manager:",
			error.message,
		);
		console.log("Falling back to environment variable...");
		elevenLabsApiKey = process.env.ELEVENLABS_API_KEY;
	}

	// Make API key available to routes
	app.use((req, res, next) => {
		req.elevenLabsApiKey = elevenLabsApiKey;
		next();
	});

	// Routes
	app.use("/api/voice", voiceRouter);
	app.use("/api/save", saveGameRouter);

	// Health check endpoint
	app.get("/health", (req, res) => {
		res.json({
			status: "ok",
			timestamp: new Date().toISOString(),
			apiKeySource: elevenLabsApiKey
				? "configured"
				: "missing",
		});
	});

	// 404 handler
	app.use((req, res) => {
		res.status(404).json({ error: "Endpoint not found" });
	});

	// Error handler
	app.use((err, req, res, next) => {
		console.error("Error:", err);
		res.status(500).json({
			error: "Internal server error",
			message: err.message,
		});
	});

	// Start server
	app.listen(PORT, () => {
		console.log(
			`\n🎮 Stick RPG Backend Server running at http://localhost:${PORT}`,
		);
		console.log(
			`📊 Health check: http://localhost:${PORT}/health\n`,
		);
	});
}

startup();
