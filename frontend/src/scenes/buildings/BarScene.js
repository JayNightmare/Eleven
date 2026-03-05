import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Bar Scene - Socializing activities to increase charm
 */
export default class BarScene extends BuildingScene {
	constructor() {
		super("BarScene", "🍺 THE BAR");
		this.buildingColor = 0xff8c00; // Orange
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI
		this.createCommonUI();

		// Display stats and money
		this.createStatsDisplay();

		// Create socializing options
		this.createSocializingOptions();

		// Create NPC
		this.createNPC();
	}

	createStatsDisplay() {
		const width = this.cameras.main.width;

		// Stats panel
		const stats = this.statsManager.getStats();
		const xp = this.statsManager.getExperience();
		const xpNeeded = this.statsManager.getXPToNextLevel();

		this.statsText = this.add
			.text(
				20,
				100,
				`💵 Money: $${this.playerMoney}\n✨ Charm: Lv ${stats.charm} (${xp.charm}/${xpNeeded.charm} XP)`,
				{
					fontSize: "18px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 15, y: 10 },
					lineSpacing: 5,
				},
			)
			.setDepth(100);

		// Time and energy panel
		const energy = this.timeManager.getEnergy();
		this.timeText = this.add
			.text(
				width - 20,
				100,
				`Day ${this.timeManager.day}\n${this.timeManager.getTimeString()}\n⚡ Energy: ${energy}/100`,
				{
					fontSize: "18px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 15, y: 10 },
					lineSpacing: 5,
				},
			)
			.setOrigin(1, 0)
			.setDepth(100);
	}

	createSocializingOptions() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Title
		this.add
			.text(width / 2, 200, "How Will You Socialize?", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Socializing options
		const activities = [
			{
				name: "Chat at Bar",
				description: "Strike up a conversation",
				charmXP: 20,
				cost: 10,
				time: 1, // hours
				energy: 5,
				y: 280,
			},
			{
				name: "Buy Drinks",
				description: "Treat everyone to a round",
				charmXP: 40,
				cost: 30,
				time: 2,
				energy: 10,
				y: 370,
			},
			{
				name: "Tell Jokes",
				description: "Be the life of the party",
				charmXP: 50,
				cost: 15,
				time: 2,
				energy: 8,
				y: 460,
			},
			{
				name: "Play Pool",
				description: "Challenge someone friendly",
				charmXP: 30,
				cost: 5,
				time: 1,
				energy: 5,
				y: 550,
			},
			{
				name: "Host Party",
				description: "Throw an unforgettable night",
				charmXP: 120,
				cost: 80,
				time: 4,
				energy: 20,
				y: 640,
			},
		];

		activities.forEach((activity) => {
			this.createActivityButton(activity);
		});
	}

	createActivityButton(activity) {
		const width = this.cameras.main.width;

		// Container
		const container = this.add.container(width / 2, activity.y);

		// Background
		const bg = this.add
			.rectangle(0, 0, 700, 70, 0x000000, 0.7)
			.setInteractive({ useHandCursor: true });

		// Activity name
		const nameText = this.add
			.text(-330, -15, activity.name, {
				fontSize: "20px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0, 0.5);

		// Description
		const descText = this.add
			.text(-330, 10, activity.description, {
				fontSize: "14px",
				color: "#aaaaaa",
			})
			.setOrigin(0, 0.5);

		// Charm gained
		const charmText = this.add
			.text(100, 0, `+${activity.charmXP} ✨ CHR`, {
				fontSize: "16px",
				color: "#4ade80",
			})
			.setOrigin(0, 0.5);

		// Cost
		const costText = this.add
			.text(
				330,
				0,
				`$${activity.cost} | ${activity.time}h | -${activity.energy} ⚡`,
				{
					fontSize: "16px",
					color: "#fbbf24",
				},
			)
			.setOrigin(1, 0.5);

		container.add([bg, nameText, descText, charmText, costText]);

		// Make interactive
		bg.on("pointerdown", () => this.doActivity(activity));
		bg.on("pointerover", () => {
			bg.setFillStyle(0x2c3e50);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(0x000000, 0.7);
		});
	}

	doActivity(activity) {
		// Check if player has enough money
		if (!this.hasEnoughMoney(activity.cost)) {
			return; // Message shown by hasEnoughMoney
		}

		// Check if player has enough energy
		if (this.timeManager.getEnergy() < activity.energy) {
			this.showMessage("❌ Not enough energy! Go sleep.");
			return;
		}

		// Pay for activity
		this.spendMoney(activity.cost);

		// Do activity
		this.statsManager.addExperience("charm", activity.charmXP);

		// Advance time and deplete energy
		for (let i = 0; i < activity.time; i++) {
			this.timeManager.advanceTime(60); // 1 hour
		}
		this.timeManager.depleteEnergy(activity.energy);

		// Show success message
		this.showMessage(
			`✓ Great time! +${activity.charmXP} CHR XP`,
			3000,
		);

		// Update displays
		this.updateStatsDisplay();
	}

	updateStatsDisplay() {
		const stats = this.statsManager.getStats();
		const xp = this.statsManager.getExperience();
		const xpNeeded = this.statsManager.getXPToNextLevel();
		const energy = this.timeManager.getEnergy();

		this.statsText.setText(
			`💵 Money: $${this.playerMoney}\n✨ Charm: Lv ${stats.charm} (${xp.charm}/${xpNeeded.charm} XP)`,
		);

		this.timeText.setText(
			`Day ${this.timeManager.day}\n${this.timeManager.getTimeString()}\n⚡ Energy: ${energy}/100`,
		);
	}

	updateMoneyDisplay() {
		this.updateStatsDisplay();
	}

	/**
	 * Create NPC (bartender)
	 */
	createNPC() {
		const npcDef = getNPCById("bartender");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side behind the bar)
		const npcX = 200;
		const npcY = 300;

		// Create NPC visual (top-down circle)
		const appearance = this.npc.getAppearance();
		this.add
			.circle(npcX, npcY, 18, appearance.color)
			.setStrokeStyle(3, 0x000000);

		// Name label with icon
		this.add
			.text(
				npcX,
				npcY + 30,
				`${appearance.icon} ${this.npc.name}`,
				{
					fontSize: "16px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 8, y: 4 },
				},
			)
			.setOrigin(0.5);

		// Talk button
		const talkButton = this.add
			.text(npcX, npcY + 60, "💬 Talk", {
				fontSize: "18px",
				color: "#ffffff",
				backgroundColor: "#0066cc",
				padding: { x: 15, y: 8 },
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		talkButton.on("pointerdown", () => this.talkToNPC());
		talkButton.on("pointerover", () => {
			talkButton.setBackgroundColor("#0088ff");
		});
		talkButton.on("pointerout", () => {
			talkButton.setBackgroundColor("#0066cc");
		});
	}

	/**
	 * Talk to NPC - opens dialogue scene
	 */
	talkToNPC() {
		const stats = this.statsManager.getStats();
		const timeOfDay = this.timeManager.getTimeOfDay();

		// Launch dialogue scene
		this.scene.launch("DialogueScene", {
			npc: this.npc,
			context: {
				timeOfDay,
				playerStats: stats,
				stats, // For backward compatibility
			},
			onClose: (result) => {
				// Update NPC state if relationship changed
				if (
					result &&
					result.relationship !== undefined
				) {
					this.npc.relationship =
						result.relationship;
				}

				// Refresh displays in case money/stats changed
				this.updateStatsDisplay();
			},
		});
	}
}
