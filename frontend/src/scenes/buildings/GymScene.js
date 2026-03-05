import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Gym Scene - Strength training activities
 */
export default class GymScene extends BuildingScene {
	constructor() {
		super("GymScene", "💪 THE GYM");
		this.buildingColor = 0xcc0000; // Red
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI (exit button, title)
		this.createCommonUI();

		// Create NPC
		this.createNPC();

		// Display player's current stats and money
		this.createStatsDisplay();

		// Create workout activities
		this.createWorkoutActivities();
	}

	/**
	 * Create NPC (gym trainer)
	 */
	createNPC() {
		const npcData = getNPCById("gymTrainer");
		if (npcData) {
			this.npc = new NPC(npcData);

			// Create NPC visual (top-down circle)
			const x = 200;
			const y = 300;
			const appearance = this.npc.getAppearance();

			this.npcCircle = this.add.circle(
				x,
				y,
				18,
				appearance.color,
			);
			this.npcCircle.setStrokeStyle(3, 0x000000);

			// Name label
			this.npcNameText = this.add.text(
				x,
				y + 30,
				`${appearance.icon} ${this.npc.name}`,
				{
					fontSize: "16px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 8, y: 4 },
				},
			);
			this.npcNameText.setOrigin(0.5);

			// Talk button
			this.createButton(
				x - 50,
				y + 110,
				120,
				40,
				"💬 Talk",
				() => this.talkToNPC(),
				0x3498db,
				0x5dade2,
			);
		}
	}

	/**
	 * Open dialogue with NPC
	 */
	talkToNPC() {
		// Launch dialogue scene
		this.scene.launch("DialogueScene", {
			npc: this.npc,
			context: {
				timeOfDay: this.timeManager.getTimeOfDay(),
				playerStats: this.statsManager.getStats(),
				stats: this.statsManager.getStats(),
			},
			onClose: (result) => {
				// Update NPC relationship if changed
				if (result.relationship !== undefined) {
					console.log(
						`Relationship with ${this.npc.name}: ${result.relationship}`,
					);
				}
			},
		});
	}

	createStatsDisplay() {
		const width = this.cameras.main.width;

		// Stats panel (top-left)
		const stats = this.statsManager.getStats();
		const xp = this.statsManager.getExperience();
		const xpNeeded = this.statsManager.getXPToNextLevel();

		this.statsText = this.add
			.text(
				20,
				100,
				`💵 Money: $${this.playerMoney}\n💪 Strength: Lv ${stats.strength} (${xp.strength}/${xpNeeded.strength} XP)\n❤️ Endurance: Lv ${stats.endurance} (${xp.endurance}/${xpNeeded.endurance} XP)`,
				{
					fontSize: "18px",
					color: "#ffffff",
					backgroundColor: "#000000aa",
					padding: { x: 15, y: 10 },
					lineSpacing: 5,
				},
			)
			.setDepth(100);

		// Time and energy panel (top-right)
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

	createWorkoutActivities() {
		const width = this.cameras.main.width;
		const height = this.cameras.main.height;

		// Title
		this.add
			.text(width / 2, 200, "Choose Your Workout", {
				fontSize: "28px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Workout options
		const workouts = [
			{
				name: "Light Workout",
				description: "Lift some weights",
				strengthXP: 25,
				enduranceXP: 10,
				time: 1, // hours
				energy: 10,
				y: 280,
			},
			{
				name: "Heavy Workout",
				description: "Push your limits!",
				strengthXP: 50,
				enduranceXP: 20,
				time: 2,
				energy: 20,
				y: 380,
			},
			{
				name: "Cardio Session",
				description: "Build endurance",
				strengthXP: 10,
				enduranceXP: 40,
				time: 1,
				energy: 15,
				y: 480,
			},
			{
				name: "Intense Training",
				description: "Maximum gains!",
				strengthXP: 100,
				enduranceXP: 50,
				time: 3,
				energy: 30,
				y: 580,
			},
		];

		workouts.forEach((workout) => {
			this.createWorkoutButton(workout);
		});
	}

	createWorkoutButton(workout) {
		const width = this.cameras.main.width;

		// Container for workout option
		const container = this.add.container(width / 2, workout.y);

		// Background
		const bg = this.add
			.rectangle(0, 0, 700, 80, 0x000000, 0.7)
			.setInteractive({ useHandCursor: true });

		// Workout name
		const nameText = this.add
			.text(-330, -20, workout.name, {
				fontSize: "22px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0, 0.5);

		// Description
		const descText = this.add
			.text(-330, 10, workout.description, {
				fontSize: "16px",
				color: "#aaaaaa",
			})
			.setOrigin(0, 0.5);

		// Stats gained
		const statsText = this.add
			.text(
				100,
				0,
				`+${workout.strengthXP} 💪 STR | +${workout.enduranceXP} ❤️ END`,
				{
					fontSize: "16px",
					color: "#4ade80",
				},
			)
			.setOrigin(0, 0.5);

		// Time and energy cost
		const costText = this.add
			.text(
				330,
				0,
				`${workout.time}h | -${workout.energy} ⚡`,
				{
					fontSize: "16px",
					color: "#fbbf24",
				},
			)
			.setOrigin(1, 0.5);

		container.add([bg, nameText, descText, statsText, costText]);

		// Make interactive
		bg.on("pointerdown", () => this.performWorkout(workout));
		bg.on("pointerover", () => {
			bg.setFillStyle(0x2c3e50);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(0x000000, 0.7);
		});
	}

	performWorkout(workout) {
		// Check if player has enough energy
		if (this.timeManager.getEnergy() < workout.energy) {
			this.showMessage("❌ Not enough energy! Go sleep.");
			return;
		}

		// Perform workout
		this.statsManager.addExperience("strength", workout.strengthXP);
		this.statsManager.addExperience(
			"endurance",
			workout.enduranceXP,
		);

		// Advance time and deplete energy
		for (let i = 0; i < workout.time; i++) {
			this.timeManager.advanceTime(60); // 1 hour
		}
		this.timeManager.depleteEnergy(workout.energy);

		// Show success message
		this.showMessage(
			`✓ Workout complete! +${workout.strengthXP} STR XP, +${workout.enduranceXP} END XP`,
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
			`💵 Money: $${this.playerMoney}\n💪 Strength: Lv ${stats.strength} (${xp.strength}/${xpNeeded.strength} XP)\n❤️ Endurance: Lv ${stats.endurance} (${xp.endurance}/${xpNeeded.endurance} XP)`,
		);

		this.timeText.setText(
			`Day ${this.timeManager.day}\n${this.timeManager.getTimeString()}\n⚡ Energy: ${energy}/100`,
		);
	}

	updateMoneyDisplay() {
		this.updateStatsDisplay();
	}
}
