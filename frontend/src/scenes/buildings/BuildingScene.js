import Phaser from "phaser";

/**
 * Base Building Scene - Common functionality for all building interiors
 */
export default class BuildingScene extends Phaser.Scene {
	constructor(key, buildingName) {
		super(key);
		this.buildingName = buildingName;
		this.buildingColor = 0x333333;
	}

	init(data) {
		// Receive data from GameScene
		this.playerData = data.playerData || {};
		this.statsManager = data.statsManager;
		this.timeManager = data.timeManager;
		this.playerMoney = data.playerMoney || 0;
	}

	create() {
		// Base create method - can be overridden by child classes
	}

	/**
	 * Create common building UI elements (exit button, etc.)
	 */
	createCommonUI() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Building name title
		this.add
			.text(width / 2, 40, this.buildingName, {
				fontSize: "32px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setDepth(100);

		// Exit button (top-right)
		const exitButton = this.add
			.text(width - 20, 20, "✕ Exit", {
				fontSize: "20px",
				color: "#ffffff",
				backgroundColor: "#e74c3c",
				padding: { x: 15, y: 10 },
			})
			.setOrigin(1, 0)
			.setInteractive({ useHandCursor: true })
			.setDepth(100);

		exitButton.on("pointerdown", () => this.exitBuilding());
		exitButton.on("pointerover", () => {
			exitButton.setStyle({ backgroundColor: "#c0392b" });
		});
		exitButton.on("pointerout", () => {
			exitButton.setStyle({ backgroundColor: "#e74c3c" });
		});

		// ESC key to exit
		this.input.keyboard.on("keydown-ESC", () =>
			this.exitBuilding(),
		);
	}

	/**
	 * Create building interior background
	 */
	createInterior(color) {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Floor
		this.add.rectangle(
			width / 2,
			height / 2,
			width,
			height,
			color || this.buildingColor,
		);

		// Walls (darker shade)
		const wallColor = Phaser.Display.Color.IntegerToColor(
			color || this.buildingColor,
		);
		const darkerWallColor = Phaser.Display.Color.RGBToString(
			Math.floor(wallColor.red * 0.7),
			Math.floor(wallColor.green * 0.7),
			Math.floor(wallColor.blue * 0.7),
		);

		// Left wall
		this.add
			.rectangle(
				0,
				height / 2,
				40,
				height,
				parseInt(darkerWallColor.replace("#", ""), 16),
			)
			.setOrigin(0, 0.5);

		// Right wall
		this.add
			.rectangle(
				width,
				height / 2,
				40,
				height,
				parseInt(darkerWallColor.replace("#", ""), 16),
			)
			.setOrigin(1, 0.5);

		// Top wall
		this.add
			.rectangle(
				width / 2,
				0,
				width,
				80,
				parseInt(darkerWallColor.replace("#", ""), 16),
			)
			.setOrigin(0.5, 0);
	}

	/**
	 * Show a temporary message on screen
	 */
	showMessage(text, duration = 2000) {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		const message = this.add
			.text(width / 2, height - 100, text, {
				fontSize: "24px",
				color: "#ffffff",
				backgroundColor: "#000000",
				padding: { x: 20, y: 15 },
			})
			.setOrigin(0.5)
			.setDepth(200)
			.setAlpha(0);

		// Fade in
		this.tweens.add({
			targets: message,
			alpha: 1,
			duration: 300,
			onComplete: () => {
				// Fade out after duration
				this.time.delayedCall(duration, () => {
					this.tweens.add({
						targets: message,
						alpha: 0,
						duration: 300,
						onComplete: () =>
							message.destroy(),
					});
				});
			},
		});
	}

	/**
	 * Create an activity button
	 */
	createButton(
		x,
		y,
		width,
		height,
		text,
		callback,
		colorNormal,
		colorHover,
	) {
		// Create a rectangle background
		const bg = this.add
			.rectangle(
				x + width / 2,
				y + height / 2,
				width,
				height,
				colorNormal,
			)
			.setInteractive({ useHandCursor: true });

		// Create text on top
		const buttonText = this.add
			.text(x + width / 2, y + height / 2, text, {
				fontSize: "18px",
				fontFamily: "Arial",
				color: "#ffffff",
			})
			.setOrigin(0.5);

		// Create container
		const button = this.add.container(0, 0, [bg, buttonText]);

		// Handle callback (can be null for disabled buttons)
		if (callback) {
			bg.on("pointerdown", callback);
		}

		// Hover effects
		bg.on("pointerover", () => {
			bg.setFillStyle(colorHover);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(colorNormal);
		});

		return button;
	}

	/**
	 * Exit building and return to GameScene
	 */
	exitBuilding() {
		// Pass updated data back to GameScene
		this.scene.start("GameScene", {
			playerColor: this.playerData.color,
			returnData: {
				money: this.playerMoney,
				stats: this.statsManager.toJSON(),
				time: this.timeManager.toJSON(),
			},
		});
	}

	/**
	 * Check if player has enough money
	 */
	hasEnoughMoney(amount) {
		return this.playerMoney >= amount;
	}

	/**
	 * Deduct money from player
	 */
	spendMoney(amount) {
		if (this.hasEnoughMoney(amount)) {
			this.playerMoney -= amount;
			this.updateMoneyDisplay();
			return true;
		}
		this.showMessage("❌ Not enough money!");
		return false;
	}

	/**
	 * Add money to player
	 */
	addMoney(amount) {
		this.playerMoney += amount;
		this.updateMoneyDisplay();
	}

	/**
	 * Update money display (override in child classes if needed)
	 */
	updateMoneyDisplay() {
		// Override in child classes if UI needs updating
	}
}
