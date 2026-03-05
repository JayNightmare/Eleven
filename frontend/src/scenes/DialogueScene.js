import Phaser from "phaser";
import VoiceManager from "../systems/VoiceManager.js";
import DialogueManager from "../systems/DialogueManager.js";

/**
 * Dialogue Scene - NPC dialogue overlay with voice
 */
export default class DialogueScene extends Phaser.Scene {
	constructor() {
		super("DialogueScene");
	}

	init(data) {
		this.npc = data.npc;
		this.context = data.context || {};
		this.onCloseCallback = data.onClose;
	}

	create() {
		// Initialize managers
		this.voiceManager = new VoiceManager();
		this.dialogueManager = new DialogueManager(this);

		// Set up voice callbacks
		this.voiceManager.onPlay((data) => {
			if (data.status === "playing") {
				this.showSpeakingIndicator();
			}
		});

		this.voiceManager.onEnd(() => {
			this.hideSpeakingIndicator();
		});

		this.voiceManager.onError((data) => {
			console.error("Voice error:", data.error);
			this.showMessage("(Voice unavailable)", "#e74c3c");
		});

		// Start conversation
		const conversation = this.dialogueManager.startConversation(
			this.npc,
			this.context,
		);

		// Create UI
		this.createDialogueUI();

		// Show greeting
		this.showNPCDialogue(
			conversation.text,
			conversation.voiceId,
			conversation.options,
		);

		// Set up input
		this.input.keyboard.on("keydown-ESC", () => {
			this.closeDialogue();
		});
	}

	/**
	 * Create dialogue UI
	 */
	createDialogueUI() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Dark overlay
		this.overlay = this.add.rectangle(
			width / 2,
			height / 2,
			width,
			height,
			0x000000,
			0.7,
		);
		this.overlay.setScrollFactor(0);
		this.overlay.setDepth(1000);

		// Main dialogue box
		this.dialogueBox = this.add.rectangle(
			width / 2,
			height - 150,
			width - 80,
			220,
			0x2c3e50,
			1.0,
		);
		this.dialogueBox.setStrokeStyle(3, 0x34495e);
		this.dialogueBox.setScrollFactor(0);
		this.dialogueBox.setDepth(1001);

		// NPC name plate
		const npcAppearance = this.npc.getAppearance();
		this.npcNameBox = this.add.rectangle(
			100,
			height - 270,
			200,
			40,
			npcAppearance.color,
			1.0,
		);
		this.npcNameBox.setScrollFactor(0);
		this.npcNameBox.setDepth(1002);

		this.npcNameText = this.add.text(
			100,
			height - 270,
			`${npcAppearance.icon} ${this.npc.name}`,
			{
				fontSize: "20px",
				fontFamily: "Arial",
				color: "#ffffff",
				fontStyle: "bold",
			},
		);
		this.npcNameText.setOrigin(0.5);
		this.npcNameText.setScrollFactor(0);
		this.npcNameText.setDepth(1003);

		// Speaking indicator (shows when voice is playing)
		this.speakingIndicator = this.add.text(
			220,
			height - 270,
			"🔊",
			{
				fontSize: "24px",
			},
		);
		this.speakingIndicator.setOrigin(0.5);
		this.speakingIndicator.setScrollFactor(0);
		this.speakingIndicator.setDepth(1003);
		this.speakingIndicator.setVisible(false);

		// Dialogue text
		this.dialogueText = this.add.text(70, height - 230, "", {
			fontSize: "18px",
			fontFamily: "Arial",
			color: "#ecf0f1",
			wordWrap: { width: width - 180 },
		});
		this.dialogueText.setScrollFactor(0);
		this.dialogueText.setDepth(1002);

		// Options container
		this.optionsY = height - 120;
		this.optionsContainer = this.add.container(70, this.optionsY);
		this.optionsContainer.setScrollFactor(0);
		this.optionsContainer.setDepth(1002);

		// Close button
		const closeButton = this.createButton(
			width - 60,
			height - 270,
			100,
			35,
			"Close (ESC)",
			() => this.closeDialogue(),
			0xe74c3c,
			0xc0392b,
		);
		closeButton.setScrollFactor(0);
		closeButton.setDepth(1003);

		// Relationship indicator
		this.relationshipText = this.add.text(
			width - 200,
			height - 320,
			"",
			{
				fontSize: "14px",
				fontFamily: "Arial",
				color: "#95a5a6",
			},
		);
		this.relationshipText.setScrollFactor(0);
		this.relationshipText.setDepth(1002);
		this.updateRelationshipDisplay();
	}

	/**
	 * Show NPC dialogue with voice
	 */
	async showNPCDialogue(text, voiceId, options) {
		// Update dialogue text
		this.dialogueText.setText(text);

		// Show options immediately (don't block on voice)
		this.showOptions(options);

		// Play voice in background
		this.voiceManager.speak(text, voiceId);
	}

	/**
	 * Show dialogue options for player
	 */
	showOptions(options) {
		// Clear previous options
		this.optionsContainer.removeAll(true);

		if (!options || options.length === 0) {
			return;
		}

		// Create option buttons
		options.forEach((option, index) => {
			const button = this.createOptionButton(
				0,
				index * 45,
				option,
			);
			this.optionsContainer.add(button);
		});
	}

	/**
	 * Create an option button
	 */
	createOptionButton(x, y, option) {
		const container = this.add.container(x, y);

		// Check if option is available
		const isAvailable = this.npc.isOptionAvailable(
			option,
			this.context,
		);
		const bgColor = isAvailable ? 0x3498db : 0x7f8c8d;
		const hoverColor = isAvailable ? 0x5dade2 : 0x95a5a6;

		// Button background
		const bg = this.add.rectangle(0, 0, 1100, 38, bgColor);
		bg.setOrigin(0, 0.5);
		container.add(bg);

		// Option text
		const text = this.add.text(10, 0, `→ ${option.text}`, {
			fontSize: "16px",
			fontFamily: "Arial",
			color: isAvailable ? "#ffffff" : "#aaaaaa",
		});
		text.setOrigin(0, 0.5);
		container.add(text);

		// Show requirements if locked
		if (!isAvailable && option.requires) {
			const reqText = this.getRequirementText(
				option.requires,
			);
			const reqLabel = this.add.text(
				1090,
				0,
				`(${reqText})`,
				{
					fontSize: "12px",
					fontFamily: "Arial",
					color: "#e74c3c",
				},
			);
			reqLabel.setOrigin(1, 0.5);
			container.add(reqLabel);
		}

		// Make interactive if available
		if (isAvailable) {
			bg.setInteractive({ useHandCursor: true });

			bg.on("pointerover", () => {
				bg.setFillStyle(hoverColor);
			});

			bg.on("pointerout", () => {
				bg.setFillStyle(bgColor);
			});

			bg.on("pointerdown", () => {
				this.selectOption(option.id);
			});
		}

		return container;
	}

	/**
	 * Get requirement text for display
	 */
	getRequirementText(requires) {
		const parts = [];

		if (requires.stats) {
			for (const [stat, value] of Object.entries(
				requires.stats,
			)) {
				const playerStat =
					this.context.stats?.[stat] || 0;
				if (playerStat < value) {
					parts.push(`${stat} ${value}`);
				}
			}
		}

		if (requires.relationship !== undefined) {
			if (this.npc.relationship < requires.relationship) {
				parts.push(
					`relationship ${requires.relationship}`,
				);
			}
		}

		return parts.join(", ") || "locked";
	}

	/**
	 * Player selects an option
	 */
	async selectOption(optionId) {
		// Get response from NPC
		const response = this.dialogueManager.selectOption(optionId);

		// Apply effects
		if (response.effects) {
			this.applyEffects(response.effects);
		}

		// Update relationship display
		this.updateRelationshipDisplay();

		// Show NPC response
		await this.showNPCDialogue(
			response.text,
			response.voiceId,
			response.options,
		);
	}

	/**
	 * Apply dialogue effects (money, items, etc.)
	 */
	applyEffects(effects) {
		if (effects.money) {
			// Would update player money
			console.log(`Money effect: ${effects.money}`);
		}

		if (effects.discountUnlocked) {
			console.log("Discount unlocked!");
		}

		// Add more effect types as needed
	}

	/**
	 * Update relationship display
	 */
	updateRelationshipDisplay() {
		const rel = this.npc.relationship;
		let relText = "";
		let relColor = "#95a5a6";

		if (rel >= 80) {
			relText = "💚 Best Friends";
			relColor = "#2ecc71";
		} else if (rel >= 50) {
			relText = "💙 Friends";
			relColor = "#3498db";
		} else if (rel >= 20) {
			relText = "😊 Friendly";
			relColor = "#1abc9c";
		} else if (rel >= -20) {
			relText = "😐 Neutral";
			relColor = "#95a5a6";
		} else if (rel >= -50) {
			relText = "😠 Unfriendly";
			relColor = "#e67e22";
		} else {
			relText = "💔 Hostile";
			relColor = "#e74c3c";
		}

		this.relationshipText.setText(`Relationship: ${relText}`);
		this.relationshipText.setColor(relColor);
	}

	/**
	 * Show speaking indicator
	 */
	showSpeakingIndicator() {
		this.speakingIndicator.setVisible(true);

		// Animate
		this.tweens.add({
			targets: this.speakingIndicator,
			alpha: 0.3,
			yoyo: true,
			repeat: -1,
			duration: 500,
		});
	}

	/**
	 * Hide speaking indicator
	 */
	hideSpeakingIndicator() {
		this.tweens.killTweensOf(this.speakingIndicator);
		this.speakingIndicator.setVisible(false);
		this.speakingIndicator.setAlpha(1);
	}

	/**
	 * Show temporary message
	 */
	showMessage(text, color = "#ffffff") {
		const width = this.cameras.main.width;
		const message = this.add.text(width / 2, 100, text, {
			fontSize: "16px",
			fontFamily: "Arial",
			color: color,
			backgroundColor: "#000000",
			padding: { x: 15, y: 10 },
		});
		message.setOrigin(0.5);
		message.setScrollFactor(0);
		message.setDepth(2000);

		// Fade out after delay
		this.time.delayedCall(2000, () => {
			this.tweens.add({
				targets: message,
				alpha: 0,
				duration: 500,
				onComplete: () => message.destroy(),
			});
		});
	}

	/**
	 * Create a button
	 */
	createButton(
		x,
		y,
		width,
		height,
		text,
		callback,
		bgColor = 0x3498db,
		hoverColor = 0x5dade2,
	) {
		const container = this.add.container(x, y);

		const bg = this.add.rectangle(0, 0, width, height, bgColor);
		bg.setInteractive({ useHandCursor: true });
		container.add(bg);

		const label = this.add.text(0, 0, text, {
			fontSize: "14px",
			fontFamily: "Arial",
			color: "#ffffff",
		});
		label.setOrigin(0.5);
		container.add(label);

		bg.on("pointerover", () => {
			bg.setFillStyle(hoverColor);
		});

		bg.on("pointerout", () => {
			bg.setFillStyle(bgColor);
		});

		bg.on("pointerdown", callback);

		return container;
	}

	/**
	 * Close dialogue and return to previous scene
	 */
	closeDialogue() {
		// Stop voice
		this.voiceManager.stop();

		// End conversation
		const result = this.dialogueManager.endConversation();

		// Clean up
		this.destroy();

		// Return to previous scene
		this.scene.stop();

		// Call callback if provided
		if (this.onCloseCallback) {
			this.onCloseCallback(result);
		}
	}

	/**
	 * Clean up resources
	 */
	destroy() {
		if (this.voiceManager) {
			this.voiceManager.destroy();
		}
	}
}
