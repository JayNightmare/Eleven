// Game configuration
export const gameConfig = {
	// Canvas size
	canvas: {
		width: 1280,
		height: 720,
	},

	// Backend API endpoints
	api: {
		baseUrl: import.meta.env.DEV
			? "http://localhost:3000"
			: "https://stick-rpg-backend.example.com", // Update with your production URL
		voice: {
			generate: "/api/voice/generate",
			voices: "/api/voice/voices",
			cacheStats: "/api/voice/cache-stats",
		},
		save: {
			save: "/api/save/game",
			load: "/api/save/game",
			list: "/api/save/list",
			delete: "/api/save/game",
		},
	},

	// Player configuration
	player: {
		colors: [
			"#ff6b6b",
			"#4ecdc4",
			"#45b7d1",
			"#f7b731",
			"#5f27cd",
			"#00d2d3",
		],
	},

	// Voice settings
	voice: {
		enabled: true,
		cacheDynamic: true,
		cacheExpiry: 3600000, // 1 hour in milliseconds
	},

	// Game settings
	game: {
		startingMoney: 100,
		startingStats: {
			strength: 1,
			intelligence: 1,
			charm: 1,
			endurance: 1,
		},
	},
};

// Phaser game configuration
export const phaserConfig = {
	type: Phaser.AUTO,
	parent: "game-container",
	width: gameConfig.canvas.width,
	height: gameConfig.canvas.height,
	scale: {
		mode: Phaser.Scale.FIT,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	render: {
		pixelArt: true,
		antialias: false,
	},
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: false,
		},
	},
	scene: [],
};
