import Phaser from "phaser";

/**
 * Player - Main character with top-down movement, stats, inventory
 */
export default class Player extends Phaser.Physics.Arcade.Sprite {
	constructor(scene, x, y, color = "#ff6b6b") {
		// Create a top-down player texture
		const texKey = "player_topdown";
		if (scene.textures.exists(texKey)) {
			scene.textures.remove(texKey);
		}
		const size = 32;
		const canvas = document.createElement("canvas");
		canvas.width = size;
		canvas.height = size;
		const ctx = canvas.getContext("2d");

		// Body circle
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.arc(size / 2, size / 2, 12, 0, Math.PI * 2);
		ctx.fill();
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.stroke();

		// Direction indicator (small triangle pointing up)
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.moveTo(size / 2, 4);
		ctx.lineTo(size / 2 - 4, 12);
		ctx.lineTo(size / 2 + 4, 12);
		ctx.closePath();
		ctx.fill();

		scene.textures.addCanvas(texKey, canvas);

		super(scene, x, y, texKey);

		this.scene = scene;
		this.color = color;
		this.speed = 250;
		this.facing = "up"; // up, down, left, right

		// Add to scene
		scene.add.existing(this);
		scene.physics.add.existing(this);

		// Configure physics
		this.setCollideWorldBounds(true);
		this.body.setCircle(12, 4, 4);
		this.setDepth(10);

		// Player state
		this.money = 100;
		this.inventory = [];

		// Input keys
		this.cursors = scene.input.keyboard.createCursorKeys();
		this.keys = scene.input.keyboard.addKeys({
			W: Phaser.Input.Keyboard.KeyCodes.W,
			A: Phaser.Input.Keyboard.KeyCodes.A,
			S: Phaser.Input.Keyboard.KeyCodes.S,
			D: Phaser.Input.Keyboard.KeyCodes.D,
			E: Phaser.Input.Keyboard.KeyCodes.E,
		});
	}

	/**
	 * Movement update
	 */
	update() {
		// Reset velocity
		this.setVelocity(0, 0);

		// Handle movement input
		if (this.cursors.left.isDown || this.keys.A.isDown) {
			this.setVelocityX(-this.speed);
			this.facing = "left";
		} else if (this.cursors.right.isDown || this.keys.D.isDown) {
			this.setVelocityX(this.speed);
			this.facing = "right";
		}

		if (this.cursors.up.isDown || this.keys.W.isDown) {
			this.setVelocityY(-this.speed);
			this.facing = "up";
		} else if (this.cursors.down.isDown || this.keys.S.isDown) {
			this.setVelocityY(this.speed);
			this.facing = "down";
		}

		// Normalize diagonal movement
		if (this.body.velocity.x !== 0 && this.body.velocity.y !== 0) {
			this.setVelocity(
				this.body.velocity.x * 0.707,
				this.body.velocity.y * 0.707,
			);
		}

		// Rotate sprite based on facing direction
		const angles = { up: 0, right: 90, down: 180, left: 270 };
		this.setAngle(angles[this.facing] || 0);
	}

	/**
	 * Add money
	 */
	addMoney(amount) {
		this.money += amount;
		this.scene.events.emit("moneyChanged", this.money);
		return this.money;
	}

	/**
	 * Remove money
	 */
	removeMoney(amount) {
		if (this.money >= amount) {
			this.money -= amount;
			this.scene.events.emit("moneyChanged", this.money);
			return true;
		}
		return false;
	}

	/**
	 * Add item to inventory
	 */
	addItem(item) {
		this.inventory.push(item);
		this.scene.events.emit("itemAdded", item);
	}

	/**
	 * Remove item from inventory
	 */
	removeItem(itemId) {
		const index = this.inventory.findIndex(
			(item) => item.id === itemId,
		);
		if (index !== -1) {
			const item = this.inventory.splice(index, 1)[0];
			this.scene.events.emit("itemRemoved", item);
			return item;
		}
		return null;
	}

	/**
	 * Check if player has item
	 */
	hasItem(itemId) {
		return this.inventory.some((item) => item.id === itemId);
	}

	/**
	 * Set player color
	 */
	setColor(color) {
		this.color = color;
	}

	/**
	 * Serialize player data for saving
	 */
	toJSON() {
		return {
			x: this.x,
			y: this.y,
			color: this.color,
			money: this.money,
			inventory: [...this.inventory],
		};
	}

	/**
	 * Load player data from save
	 */
	fromJSON(data) {
		this.setPosition(data.x, data.y);
		this.setColor(data.color);
		this.money = data.money;
		this.inventory = [...data.inventory];
		this.scene.events.emit("moneyChanged", this.money);
	}

	/**
	 * Clean up
	 */
	destroy(fromScene) {
		super.destroy(fromScene);
	}
}
