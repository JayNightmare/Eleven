import Phaser from "phaser";
import { gameConfig } from "../config.js";

/**
 * Menu Scene - Main menu, new game, load game, player customization
 */
export default class MenuScene extends Phaser.Scene {
	constructor() {
		super("MenuScene");
	}

	preload() {
		// Load assets here
	}

	create() {
		// Set background color
		this.cameras.main.setBackgroundColor("#1a1a1a");

		// Selected player color
		this.selectedColorIndex = 0;
		this.playerColors = gameConfig.player.colors;

		// Title text
		this.add
			.text(640, 150, "STICK RPG", {
				fontSize: 64,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		// Subtitle
		this.add
			.text(640, 220, "Voice Edition with ElevenLabs", {
				fontSize: 24,
				fontFamily: "Arial",
				color: "#cccccc",
			})
			.setOrigin(0.5);

		// Player customization section
		this.add
			.text(640, 290, "Choose Your Color:", {
				fontSize: 18,
				fontFamily: "Arial",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		// Create color selection buttons
		this.createColorSelection();

		// New Game button
		const newGameButton = this.add
			.text(640, 420, "NEW GAME", {
				fontSize: 32,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
				backgroundColor: "#4ecdc4",
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setInteractive();

		newGameButton.on("pointerover", () => {
			newGameButton.setStyle({ backgroundColor: "#45b7d1" });
		});

		newGameButton.on("pointerout", () => {
			newGameButton.setStyle({ backgroundColor: "#4ecdc4" });
		});

		newGameButton.on("pointerdown", () => {
			const selectedColor =
				this.playerColors[this.selectedColorIndex];
			this.scene.start("GameScene", {
				playerColor: selectedColor,
			});
		});

		// Load Game button
		const loadGameButton = this.add
			.text(640, 510, "LOAD GAME", {
				fontSize: 32,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
				backgroundColor: "#f7b731",
				padding: { x: 20, y: 10 },
			})
			.setOrigin(0.5)
			.setInteractive();

		loadGameButton.on("pointerover", () => {
			loadGameButton.setStyle({ backgroundColor: "#ffb94d" });
		});

		loadGameButton.on("pointerout", () => {
			loadGameButton.setStyle({ backgroundColor: "#f7b731" });
		});

		loadGameButton.on("pointerdown", () => {
			this.loadGame();
		});

		// Support button
		const supportButton = this.add
			.text(640, 620, "❤️ Support the Developer", {
				fontSize: 18,
				fontFamily: "Arial",
				color: "#ff6b6b",
			})
			.setOrigin(0.5)
			.setInteractive();

		supportButton.on("pointerover", () => {
			supportButton.setStyle({ color: "#ff9999" });
		});

		supportButton.on("pointerout", () => {
			supportButton.setStyle({ color: "#ff6b6b" });
		});

		supportButton.on("pointerdown", () => {
			window.open("https://ko-fi.com", "_blank");
		});

		// Version info
		this.add.text(
			20,
			this.cameras.main.height - 20,
			"v1.0.0 - Phase 2",
			{
				fontSize: 12,
				color: "#666666",
			},
		);

		// Controls hint
		this.add
			.text(
				640,
				this.cameras.main.height - 20,
				"Controls: WASD/Arrows to move | E to interact | ESC to pause",
				{
					fontSize: 12,
					color: "#666666",
				},
			)
			.setOrigin(0.5);
	}

	createColorSelection() {
		const startX = 400;
		const y = 330;
		const spacing = 60;

		this.colorButtons = [];

		this.playerColors.forEach((color, index) => {
			const x = startX + index * spacing;

			// Color preview circle
			const circle = this.add.circle(
				x,
				y,
				20,
				parseInt(color.replace("#", "0x")),
			);
			circle.setStrokeStyle(3, 0xffffff);
			circle.setInteractive();

			// Selection indicator
			const indicator = this.add.circle(
				x,
				y,
				28,
				0xffffff,
				0,
			);
			indicator.setStrokeStyle(4, 0xffffff);
			indicator.setVisible(index === 0); // First color selected by default

			circle.on("pointerdown", () => {
				this.selectColor(index);
			});

			circle.on("pointerover", () => {
				circle.setScale(1.2);
			});

			circle.on("pointerout", () => {
				circle.setScale(1);
			});

			this.colorButtons.push({ circle, indicator });
		});
	}

	selectColor(index) {
		// Hide all indicators
		this.colorButtons.forEach((btn) =>
			btn.indicator.setVisible(false),
		);

		// Show selected indicator
		this.colorButtons[index].indicator.setVisible(true);

		// Update selected index
		this.selectedColorIndex = index;

		console.log(`Selected color: ${this.playerColors[index]}`);
	}

	async loadGame() {
		try {
			const response = await fetch(
				"http://localhost:3000/api/save/game/save1",
			);

			if (response.ok) {
				const saveData = await response.json();
				console.log("✓ Game loaded:", saveData);

				// Start game with loaded data
				this.scene.start("GameScene", {
					playerColor:
						saveData.gameState.player.color,
					loadedData: saveData.gameState,
				});
			} else {
				this.showMessage("No save file found!");
			}
		} catch (error) {
			console.error("Load error:", error);
			this.showMessage(
				"Failed to load game (backend offline?)",
			);
		}
	}

	showMessage(text) {
		const message = this.add.text(640, 560, text, {
			fontSize: 14,
			fontFamily: "Arial",
			color: "#ff6b6b",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 },
		});
		message.setOrigin(0.5);

		this.time.delayedCall(3000, () => {
			message.destroy();
		});
	}

	update() {
		// Update logic here
	}
}
