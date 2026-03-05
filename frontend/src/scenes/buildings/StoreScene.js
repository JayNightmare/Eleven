import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Store Scene - Buy items and consumables
 */
export default class StoreScene extends BuildingScene {
	constructor() {
		super("StoreScene", "🏪 CONVENIENCE STORE");
		this.buildingColor = 0x14b8a6; // Teal
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI
		this.createCommonUI();

		// Display money
		this.createMoneyDisplay();

		// Create shop items
		this.createShopItems();

		// Create NPC
		this.createNPC();
	}

	createMoneyDisplay() {
		const width = this.cameras.main.width;

		this.moneyText = this.add
			.text(
				width / 2,
				100,
				`💵 Money: $${this.playerMoney}`,
				{
					fontSize: "24px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 20, y: 10 },
				},
			)
			.setOrigin(0.5)
			.setDepth(100);
	}

	createShopItems() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Title
		this.add
			.text(width / 2, 160, "What Would You Like to Buy?", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Shop items
		const items = [
			{
				name: "Energy Drink",
				description: "Restore 20 energy instantly",
				icon: "⚡",
				cost: 15,
				effect: () => {
					this.timeManager.restoreEnergy(20);
					this.showMessage(
						"✓ Energy restored by 20!",
						2000,
					);
				},
				y: 240,
			},
			{
				name: "Coffee",
				description: "Restore 10 energy",
				icon: "☕",
				cost: 8,
				effect: () => {
					this.timeManager.restoreEnergy(10);
					this.showMessage(
						"✓ Energy restored by 10!",
						2000,
					);
				},
				y: 320,
			},
			{
				name: "Protein Bar",
				description: "Gain 10 Strength XP",
				icon: "🍫",
				cost: 12,
				effect: () => {
					this.statsManager.addExperience(
						"strength",
						10,
					);
					this.showMessage(
						"✓ +10 Strength XP!",
						2000,
					);
				},
				y: 400,
			},
			{
				name: "Book",
				description: "Gain 15 Intelligence XP",
				icon: "📚",
				cost: 20,
				effect: () => {
					this.statsManager.addExperience(
						"intelligence",
						15,
					);
					this.showMessage(
						"✓ +15 Intelligence XP!",
						2000,
					);
				},
				y: 480,
			},
			{
				name: "Fashion Magazine",
				description: "Gain 12 Charm XP",
				icon: "📰",
				cost: 10,
				effect: () => {
					this.statsManager.addExperience(
						"charm",
						12,
					);
					this.showMessage(
						"✓ +12 Charm XP!",
						2000,
					);
				},
				y: 560,
			},
			{
				name: "Vitamin Pack",
				description: "Gain 10 Endurance XP",
				icon: "💊",
				cost: 15,
				effect: () => {
					this.statsManager.addExperience(
						"endurance",
						10,
					);
					this.showMessage(
						"✓ +10 Endurance XP!",
						2000,
					);
				},
				y: 640,
			},
		];

		items.forEach((item) => {
			this.createShopItem(item);
		});
	}

	createShopItem(item) {
		const width = this.cameras.main.width;

		// Container
		const container = this.add.container(width / 2, item.y);

		// Background
		const bg = this.add
			.rectangle(0, 0, 650, 65, 0x000000, 0.7)
			.setInteractive({ useHandCursor: true });

		// Icon
		const iconText = this.add
			.text(-305, 0, item.icon, {
				fontSize: "32px",
			})
			.setOrigin(0, 0.5);

		// Item name
		const nameText = this.add
			.text(-250, -10, item.name, {
				fontSize: "20px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0, 0.5);

		// Description
		const descText = this.add
			.text(-250, 15, item.description, {
				fontSize: "14px",
				color: "#aaaaaa",
			})
			.setOrigin(0, 0.5);

		// Price
		const priceText = this.add
			.text(305, 0, `$${item.cost}`, {
				fontSize: "22px",
				color: "#4ade80",
				fontStyle: "bold",
			})
			.setOrigin(1, 0.5);

		container.add([bg, iconText, nameText, descText, priceText]);

		// Make interactive
		bg.on("pointerdown", () => this.buyItem(item));
		bg.on("pointerover", () => {
			bg.setFillStyle(0x2c3e50);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(0x000000, 0.7);
		});
	}

	buyItem(item) {
		// Check if player has enough money
		if (!this.hasEnoughMoney(item.cost)) {
			return; // Message shown by hasEnoughMoney
		}

		// Pay for item
		this.spendMoney(item.cost);

		// Apply item effect
		item.effect();
	}

	updateMoneyDisplay() {
		this.moneyText.setText(`💵 Money: $${this.playerMoney}`);
	}

	/**
	 * Create NPC (shopkeeper)
	 */
	createNPC() {
		const npcDef = getNPCById("shopkeeper");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side behind counter)
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
				this.updateMoneyDisplay();
			},
		});
	}
}
