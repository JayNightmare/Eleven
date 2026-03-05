import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * University Scene - Intelligence-building classes
 */
export default class UniversityScene extends BuildingScene {
	constructor() {
		super("UniversityScene", "🎓 UNIVERSITY");
		this.buildingColor = 0x8b5cf6; // Purple
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI
		this.createCommonUI();

		// Display stats and money
		this.createStatsDisplay();

		// Create class options
		this.createClassOptions();

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
				`💵 Money: $${this.playerMoney}\n🧠 Intelligence: Lv ${stats.intelligence} (${xp.intelligence}/${xpNeeded.intelligence} XP)`,
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

	createClassOptions() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Title
		this.add
			.text(width / 2, 200, "Choose a Class", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Class options
		const classes = [
			{
				name: "Basic Math",
				description: "Learn the fundamentals",
				intelligenceXP: 30,
				cost: 20,
				time: 2, // hours
				energy: 5,
				y: 280,
			},
			{
				name: "Science Lab",
				description: "Hands-on experiments",
				intelligenceXP: 50,
				cost: 40,
				time: 3,
				energy: 10,
				y: 370,
			},
			{
				name: "Literature Course",
				description: "Read the classics",
				intelligenceXP: 40,
				cost: 30,
				time: 2,
				energy: 5,
				y: 460,
			},
			{
				name: "Advanced Physics",
				description: "Complex theories",
				intelligenceXP: 80,
				cost: 60,
				time: 4,
				energy: 15,
				y: 550,
			},
			{
				name: "Ph.D. Program",
				description: "Become an expert!",
				intelligenceXP: 150,
				cost: 100,
				time: 6,
				energy: 20,
				y: 640,
			},
		];

		classes.forEach((classOption) => {
			this.createClassButton(classOption);
		});
	}

	createClassButton(classOption) {
		const width = this.cameras.main.width;

		// Container
		const container = this.add.container(width / 2, classOption.y);

		// Background
		const bg = this.add
			.rectangle(0, 0, 700, 70, 0x000000, 0.7)
			.setInteractive({ useHandCursor: true });

		// Class name
		const nameText = this.add
			.text(-330, -15, classOption.name, {
				fontSize: "20px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0, 0.5);

		// Description
		const descText = this.add
			.text(-330, 10, classOption.description, {
				fontSize: "14px",
				color: "#aaaaaa",
			})
			.setOrigin(0, 0.5);

		// Intelligence gained
		const intText = this.add
			.text(80, 0, `+${classOption.intelligenceXP} 🧠 INT`, {
				fontSize: "16px",
				color: "#4ade80",
			})
			.setOrigin(0, 0.5);

		// Cost
		const costText = this.add
			.text(
				330,
				0,
				`$${classOption.cost} | ${classOption.time}h | -${classOption.energy} ⚡`,
				{
					fontSize: "16px",
					color: "#fbbf24",
				},
			)
			.setOrigin(1, 0.5);

		container.add([bg, nameText, descText, intText, costText]);

		// Make interactive
		bg.on("pointerdown", () => this.takeClass(classOption));
		bg.on("pointerover", () => {
			bg.setFillStyle(0x2c3e50);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(0x000000, 0.7);
		});
	}

	takeClass(classOption) {
		// Check if player has enough money
		if (!this.hasEnoughMoney(classOption.cost)) {
			return; // Message shown by hasEnoughMoney
		}

		// Check if player has enough energy
		if (this.timeManager.getEnergy() < classOption.energy) {
			this.showMessage("❌ Not enough energy! Go sleep.");
			return;
		}

		// Pay for class
		this.spendMoney(classOption.cost);

		// Attend class
		this.statsManager.addExperience(
			"intelligence",
			classOption.intelligenceXP,
		);

		// Advance time and deplete energy
		for (let i = 0; i < classOption.time; i++) {
			this.timeManager.advanceTime(60); // 1 hour
		}
		this.timeManager.depleteEnergy(classOption.energy);

		// Show success message
		this.showMessage(
			`✓ Class complete! +${classOption.intelligenceXP} INT XP`,
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
			`💵 Money: $${this.playerMoney}\n🧠 Intelligence: Lv ${stats.intelligence} (${xp.intelligence}/${xpNeeded.intelligence} XP)`,
		);

		this.timeText.setText(
			`Day ${this.timeManager.day}\n${this.timeManager.getTimeString()}\n⚡ Energy: ${energy}/100`,
		);
	}

	updateMoneyDisplay() {
		this.updateStatsDisplay();
	}

	/**
	 * Create NPC (professor)
	 */
	createNPC() {
		const npcDef = getNPCById("professor");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side at front of class)
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
