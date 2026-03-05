import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Apartment Scene - Sleep and furniture upgrades
 */
export default class ApartmentScene extends BuildingScene {
	constructor() {
		super("ApartmentScene", "🏠 YOUR APARTMENT");
		this.buildingColor = 0x3b82f6; // Blue
	}

	init(data) {
		super.init(data);
		// Initialize furniture upgrades (store in player data later)
		this.furniture = data.furniture || {
			bed: 1, // Level 1 = basic bed
			desk: 0,
			tv: 0,
			couch: 0,
		};
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI
		this.createCommonUI();

		// Display stats and money
		this.createStatsDisplay();

		// Create sleep and upgrade options
		this.createOptions();

		// Create NPC
		this.createNPC();
	}

	createStatsDisplay() {
		const width = this.cameras.main.width;

		// Money panel
		this.moneyText = this.add
			.text(20, 100, `💵 Money: $${this.playerMoney}`, {
				fontSize: "20px",
				color: "#ffffff",
				backgroundColor: "#000000aa",
				padding: { x: 15, y: 10 },
			})
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

	createOptions() {
		const width = this.cameras.main.width;

		// Sleep section
		this.add
			.text(width / 2, 180, "💤 Sleep", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Sleep bonus based on bed level
		const sleepBonus = this.furniture.bed * 10;
		const sleepEnergyRestored = 100 + sleepBonus;

		this.createButton(
			width / 2,
			240,
			`Sleep (Restore ${sleepEnergyRestored} energy)`,
			() => this.sleep(sleepEnergyRestored),
			{ backgroundColor: "#27ae60", hoverColor: "#229954" },
		);

		// Furniture upgrades section
		this.add
			.text(width / 2, 320, "🛋️ Furniture Upgrades", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Furniture options
		const furniture = [
			{
				name: "Bed",
				description: "Better sleep quality",
				type: "bed",
				cost: 100,
				benefit: "+10 energy per sleep",
				y: 400,
			},
			{
				name: "Desk",
				description: "Study at home",
				type: "desk",
				cost: 150,
				benefit: "+5 INT XP per use",
				y: 480,
			},
			{
				name: "TV",
				description: "Relax and unwind",
				type: "tv",
				cost: 200,
				benefit: "+5 CHR XP per use",
				y: 560,
			},
			{
				name: "Couch",
				description: "Comfortable relaxation",
				type: "couch",
				cost: 120,
				benefit: "Restore 30 energy",
				y: 640,
			},
		];

		furniture.forEach((item) => {
			this.createFurnitureOption(item);
		});

		// Create furniture action buttons (if owned)
		this.createFurnitureActions();
	}

	createFurnitureOption(item) {
		const width = this.cameras.main.width;
		const owned = this.furniture[item.type] > 0;
		const level = this.furniture[item.type];

		// Container
		const container = this.add.container(width / 2, item.y);

		// Background
		const bg = this.add
			.rectangle(
				0,
				0,
				700,
				65,
				owned ? 0x1a472a : 0x000000,
				0.7,
			)
			.setInteractive({ useHandCursor: !owned });

		// Name
		const nameText = this.add
			.text(
				-330,
				-12,
				`${item.name}${owned ? ` (Lv ${level})` : ""}`,
				{
					fontSize: "20px",
					color: "#ffffff",
					fontStyle: "bold",
				},
			)
			.setOrigin(0, 0.5);

		// Benefit
		const benefitText = this.add
			.text(-330, 15, item.benefit, {
				fontSize: "14px",
				color: "#aaaaaa",
			})
			.setOrigin(0, 0.5);

		// Status/Price
		const statusText = this.add
			.text(
				330,
				0,
				owned ? "✓ OWNED" : `BUY: $${item.cost}`,
				{
					fontSize: "18px",
					color: owned ? "#4ade80" : "#fbbf24",
					fontStyle: "bold",
				},
			)
			.setOrigin(1, 0.5);

		container.add([bg, nameText, benefitText, statusText]);

		// Make interactive only if not owned
		if (!owned) {
			bg.on("pointerdown", () => this.buyFurniture(item));
			bg.on("pointerover", () => {
				bg.setFillStyle(0x2c3e50);
			});
			bg.on("pointerout", () => {
				bg.setFillStyle(0x000000, 0.7);
			});
		}
	}

	createFurnitureActions() {
		const width = this.cameras.main.width;

		let yPos = 200;

		// Use desk (if owned)
		if (this.furniture.desk > 0) {
			const xpGain = 5 * this.furniture.desk;
			this.createButton(
				width / 2 + 200,
				yPos,
				`📚 Study at Desk (+${xpGain} INT)`,
				() => {
					this.statsManager.addExperience(
						"intelligence",
						xpGain,
					);
					this.timeManager.advanceTime(60);
					this.timeManager.depleteEnergy(5);
					this.showMessage(
						`✓ Studied! +${xpGain} INT XP`,
						2000,
					);
					this.updateTimeDisplay();
				},
				{
					fontSize: "16px",
					backgroundColor: "#8b5cf6",
					hoverColor: "#7c3aed",
				},
			);
			yPos += 60;
		}

		// Watch TV (if owned)
		if (this.furniture.tv > 0) {
			const xpGain = 5 * this.furniture.tv;
			this.createButton(
				width / 2 + 200,
				yPos,
				`📺 Watch TV (+${xpGain} CHR)`,
				() => {
					this.statsManager.addExperience(
						"charm",
						xpGain,
					);
					this.timeManager.advanceTime(60);
					this.timeManager.depleteEnergy(5);
					this.showMessage(
						`✓ Relaxed! +${xpGain} CHR XP`,
						2000,
					);
					this.updateTimeDisplay();
				},
				{
					fontSize: "16px",
					backgroundColor: "#f59e0b",
					hoverColor: "#d97706",
				},
			);
			yPos += 60;
		}

		// Rest on couch (if owned)
		if (this.furniture.couch > 0) {
			const energyGain = 30 * this.furniture.couch;
			this.createButton(
				width / 2 + 200,
				yPos,
				`🛋️ Rest on Couch (+${energyGain} ⚡)`,
				() => {
					this.timeManager.restoreEnergy(
						energyGain,
					);
					this.timeManager.advanceTime(30);
					this.showMessage(
						`✓ Rested! +${energyGain} energy`,
						2000,
					);
					this.updateTimeDisplay();
				},
				{
					fontSize: "16px",
					backgroundColor: "#10b981",
					hoverColor: "#059669",
				},
			);
		}
	}

	sleep(energyRestored) {
		this.timeManager.sleep(energyRestored);
		this.showMessage(`✓ Slept well! Energy fully restored.`, 2000);
		this.updateTimeDisplay();
	}

	buyFurniture(item) {
		// Check if player has enough money
		if (!this.hasEnoughMoney(item.cost)) {
			return;
		}

		// Buy furniture
		this.spendMoney(item.cost);
		this.furniture[item.type]++;

		this.showMessage(`✓ Purchased ${item.name}!`, 2000);

		// Recreate the scene to show new furniture
		this.scene.restart({ ...this.init, furniture: this.furniture });
	}

	updateTimeDisplay() {
		const energy = this.timeManager.getEnergy();
		this.timeText.setText(
			`Day ${this.timeManager.day}\n${this.timeManager.getTimeString()}\n⚡ Energy: ${energy}/100`,
		);
	}

	updateMoneyDisplay() {
		this.moneyText.setText(`💵 Money: $${this.playerMoney}`);
	}

	// Override exitBuilding to pass furniture data back
	exitBuilding() {
		this.scene.start("GameScene", {
			playerColor: this.playerData.color,
			returnData: {
				money: this.playerMoney,
				stats: this.statsManager.toJSON(),
				time: this.timeManager.toJSON(),
				furniture: this.furniture,
			},
		});
	}

	/**
	 * Create NPC (landlord)
	 */
	createNPC() {
		const npcDef = getNPCById("landlord");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side near entrance)
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
				npcY + 55,
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
				this.updateMoneyDisplay();
			},
		});
	}
}
