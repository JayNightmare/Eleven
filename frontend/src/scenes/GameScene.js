import Phaser from "phaser";
import Player from "../player/Player.js";
import WorldMap from "../world/WorldMap.js";
import StatsManager from "../systems/StatsManager.js";
import TimeManager from "../systems/TimeManager.js";
import StatsUI from "../ui/StatsUI.js";
import NPC from "../entities/NPC.js";
import { NPCDefinitions } from "../data/NPCDefinitions.js";

/**
 * Game Scene - Main gameplay
 */
export default class GameScene extends Phaser.Scene {
	constructor() {
		super("GameScene");
	}

	init(data) {
		// Get player color from menu scene
		this.playerColor = data.playerColor || "#ff6b6b";
		this.loadedData = data.loadedData || null;

		// Handle return data from building scenes
		this.returnData = data.returnData || null;

		// Initialize persistent game data
		this.furniture = null;
		this.loanData = null;
		this.jobData = null;
		this._enteringBuilding = false;
	}

	preload() {
		// Load assets here
	}

	create() {
		// Initialize game systems
		this.statsManager = new StatsManager(this);
		this.timeManager = new TimeManager(this);

		// Load saved data if available
		if (this.loadedData) {
			this.statsManager.fromJSON(this.loadedData.stats);
			this.timeManager.fromJSON(this.loadedData.time);
			this.furniture = this.loadedData.furniture || null;
			this.loanData = this.loadedData.loanData || null;
			this.jobData = this.loadedData.jobData || null;
		}

		// Load return data from building scenes
		if (this.returnData) {
			this.statsManager.fromJSON(this.returnData.stats);
			this.timeManager.fromJSON(this.returnData.time);
			this.furniture =
				this.returnData.furniture || this.furniture;
			this.loanData =
				this.returnData.loanData || this.loanData;
			this.jobData = this.returnData.jobData || this.jobData;
		}

		// Create world map
		this.worldMap = new WorldMap(this);

		// Set world bounds to match the larger map
		const worldSize = this.worldMap.getWorldSize();
		this.physics.world.setBounds(
			0,
			0,
			worldSize.width,
			worldSize.height,
		);
		this.cameras.main.setBounds(
			0,
			0,
			worldSize.width,
			worldSize.height,
		);

		// Create player (center of map)
		this.player = new Player(
			this,
			worldSize.width / 2,
			worldSize.height / 2,
			this.playerColor,
		);

		// Load saved player data if available
		if (this.loadedData && this.loadedData.player) {
			this.player.fromJSON(this.loadedData.player);
		}

		// Update player money from return data
		if (this.returnData && this.returnData.money !== undefined) {
			this.player.money = this.returnData.money;
		}

		// Set up collisions
		const collisionBodies = this.worldMap.getCollisionBodies();
		collisionBodies.forEach((body) => {
			this.physics.add.collider(this.player, body);
		});

		// Set up door collision — entering a building on contact
		const doors = this.worldMap.getDoors();
		doors.forEach((door) => {
			this.physics.add.overlap(
				this.player,
				door,
				(player, doorObj) => {
					this.enterBuilding(
						doorObj.getData("buildingName"),
					);
				},
				null,
				this,
			);
		});

		// Set up NPC talk zones
		this.currentNpcZone = null;
		this._npcOverlapping = false;
		const npcZones = this.worldMap.getNpcZones();
		npcZones.forEach((zone) => {
			this.physics.add.overlap(
				this.player,
				zone,
				(player, z) => {
					this.currentNpcZone = z;
					this._npcOverlapping = true;
				},
				null,
				this,
			);
		});

		// Set up NPC body colliders (so player can't walk through NPCs)
		const npcBodies = this.worldMap.getNpcBodies();
		npcBodies.forEach((body) => {
			this.physics.add.collider(this.player, body);
		});

		// Create UI
		this.statsUI = new StatsUI(this);
		this.statsUI.updateStats();
		this.statsUI.updateMoney(this.player.money);
		this.statsUI.updateTime();
		this.statsUI.updateEnergy();

		// Set up camera to follow player
		this.cameras.main.startFollow(this.player);
		this.cameras.main.setZoom(2);

		// Create interaction prompt (zoom-compensated)
		const zoom = this.cameras.main.zoom;
		const promptPos = this.screenToWorld(640, 620);
		this.interactionPrompt = this.add.text(
			promptPos.x,
			promptPos.y,
			"",
			{
				fontSize: 16,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffff00",
				backgroundColor: "#000000",
				padding: { x: 10, y: 5 },
			},
		);
		this.interactionPrompt.setOrigin(0.5);
		this.interactionPrompt.setScrollFactor(0);
		this.interactionPrompt.setDepth(1001);
		this.interactionPrompt.setVisible(false);
		this.interactionPrompt.setScale(1 / zoom);

		// Set up keyboard shortcuts
		this.setupKeyboardShortcuts();

		// Event listeners
		this.events.on("moneyChanged", (amount) => {
			this.statsUI.updateMoney(amount);
		});

		this.events.on("timeUpdated", () => {
			this.statsUI.updateTime();
			this.statsUI.updateEnergy();
		});

		// Welcome message
		this.showMessage(
			"Welcome to Stick RPG! Use WASD/Arrow keys to move.\\nWalk into doors to enter. Press E to talk to NPCs.",
		);

		console.log("🎮 Game started!");
	}

	setupKeyboardShortcuts() {
		// ESC - Pause/Menu
		this.input.keyboard.on("keydown-ESC", () => {
			this.pauseGame();
		});

		// E - Interact with NPCs
		this.input.keyboard.on("keydown-E", () => {
			this.handleNpcInteraction();
		});

		// T - Test: Add stats XP
		this.input.keyboard.on("keydown-T", () => {
			this.statsManager.addExperience("strength", 50);
			this.statsUI.updateStats();
		});

		// M - Test: Add money
		this.input.keyboard.on("keydown-M", () => {
			this.player.addMoney(100);
		});

		// N - Test: Advance time
		this.input.keyboard.on("keydown-N", () => {
			this.timeManager.advanceTime(60); // 1 hour
		});

		// B - Test: Sleep
		this.input.keyboard.on("keydown-B", () => {
			this.timeManager.sleep();
		});

		// V - Test voice
		this.input.keyboard.on("keydown-V", async () => {
			await this.testVoice();
		});

		// S - Save game
		this.input.keyboard.on("keydown-S", () => {
			if (
				this.input.keyboard.checkDown(
					this.input.keyboard.addKey("SHIFT"),
					0,
				)
			) {
				this.saveGame();
			}
		});
	}

	handleNpcInteraction() {
		if (!this.currentNpcZone) return;

		const npcName = this.currentNpcZone.getData("npcName");
		const building = this.currentNpcZone.getData("building");

		if (npcName) {
			console.log(`Talking to ${npcName}...`);

			// Map overworld NPC name to NPC definition key
			const nameToKey = {
				Marcus: "gymTrainer",
				Ruby: "bartender",
				"Mr. Chen": "shopkeeper",
				"Dr. Williams": "professor",
				"Mrs. Thompson": "landlord",
				Richard: "banker",
				Jessica: "recruiter",
			};

			const defKey = nameToKey[npcName];
			const npcDef = defKey ? NPCDefinitions[defKey] : null;

			if (npcDef) {
				const npc = new NPC(npcDef);
				const context = {
					timeOfDay: this.timeManager
						? this.timeManager.getTimeOfDay()
						: "day",
					playerStats: this.statsManager
						? this.statsManager.toJSON()
						: {},
					firstMeeting: true,
				};

				this.scene.launch("DialogueScene", {
					npc,
					context,
					onClose: () => {
						this.scene.resume("GameScene");
					},
				});
				this.scene.pause("GameScene");
			} else {
				this.showMessage(`${npcName}: Hello there!`);
			}
		}
	}

	enterBuilding(buildingName) {
		if (!buildingName || this._enteringBuilding) return;
		this._enteringBuilding = true;

		console.log(`Entering ${buildingName}...`);

		const sceneMap = {
			GYM: "GymScene",
			BAR: "BarScene",
			STORE: "StoreScene",
			UNIVERSITY: "UniversityScene",
			APARTMENT: "ApartmentScene",
			BANK: "BankScene",
			"JOB CENTER": "JobCenterScene",
		};

		const sceneKey = sceneMap[buildingName];

		if (sceneKey) {
			const buildingData = {
				playerData: {
					color: this.playerColor,
				},
				statsManager: this.statsManager,
				timeManager: this.timeManager,
				playerMoney: this.player.money,
				furniture: this.furniture,
				loanData: this.loanData,
				jobData: this.jobData,
			};

			this.scene.start(sceneKey, buildingData);
		}
	}

	pauseGame() {
		this.timeManager.pause();
		this.showMessage(
			"Game Paused\\nPress ESC to resume or M to return to menu",
			true,
		);

		const zoom = this.cameras.main.zoom;

		// Create pause overlay
		const overlayPos = this.screenToWorld(640, 360);
		const overlay = this.add.rectangle(
			overlayPos.x,
			overlayPos.y,
			1280 / zoom,
			720 / zoom,
			0x000000,
			0.7,
		);
		overlay.setScrollFactor(0);
		overlay.setDepth(2000);

		const titlePos = this.screenToWorld(640, 300);
		const pauseText = this.add.text(
			titlePos.x,
			titlePos.y,
			"PAUSED",
			{
				fontSize: 48,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
			},
		);
		pauseText.setOrigin(0.5);
		pauseText.setScrollFactor(0);
		pauseText.setDepth(2001);
		pauseText.setScale(1 / zoom);

		const resumePos = this.screenToWorld(640, 400);
		const resumeButton = this.add
			.text(resumePos.x, resumePos.y, "Resume (ESC)", {
				fontSize: 24,
				fontFamily: "Arial",
				color: "#4ecdc4",
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001)
			.setScale(1 / zoom)
			.setInteractive();

		const menuPos = this.screenToWorld(640, 450);
		const menuButton = this.add
			.text(menuPos.x, menuPos.y, "Main Menu (M)", {
				fontSize: 24,
				fontFamily: "Arial",
				color: "#f7b731",
			})
			.setOrigin(0.5)
			.setScrollFactor(0)
			.setDepth(2001)
			.setScale(1 / zoom)
			.setInteractive();

		const onResume = () => {
			overlay.destroy();
			pauseText.destroy();
			resumeButton.destroy();
			menuButton.destroy();
			this.timeManager.resume();
			this.input.keyboard.off("keydown-ESC", onResume);
			this.input.keyboard.off("keydown-M", onMenu);
			this.setupKeyboardShortcuts();
		};

		const onMenu = () => {
			this.scene.start("MenuScene");
		};

		this.input.keyboard.once("keydown-ESC", onResume);
		this.input.keyboard.once("keydown-M", onMenu);
		resumeButton.on("pointerdown", onResume);
		menuButton.on("pointerdown", onMenu);
	}

	showMessage(text, temporary = true) {
		const zoom = this.cameras.main.zoom;
		const pos = this.screenToWorld(640, 660);
		const message = this.add.text(pos.x, pos.y, text, {
			fontSize: 14,
			fontFamily: "Arial",
			color: "#ffffff",
			backgroundColor: "#000000",
			padding: { x: 10, y: 5 },
			align: "center",
		});
		message.setOrigin(0.5);
		message.setScrollFactor(0);
		message.setDepth(1002);
		message.setScale(1 / zoom);

		if (temporary) {
			this.time.delayedCall(3000, () => {
				message.destroy();
			});
		}

		return message;
	}

	async saveGame() {
		const saveData = {
			player: this.player.toJSON(),
			stats: this.statsManager.toJSON(),
			time: this.timeManager.toJSON(),
			furniture: this.furniture,
			loanData: this.loanData,
			jobData: this.jobData,
		};

		try {
			const response = await fetch(
				"http://localhost:3000/api/save/game",
				{
					method: "POST",
					headers: {
						"Content-Type":
							"application/json",
					},
					body: JSON.stringify({
						saveSlot: "save1",
						gameState: saveData,
					}),
				},
			);

			if (response.ok) {
				this.showMessage("✓ Game Saved!");
				console.log("✓ Game saved successfully");
			} else {
				this.showMessage("✗ Failed to save game");
				console.error("Failed to save game");
			}
		} catch (error) {
			this.showMessage("✗ Save error (backend offline?)");
			console.error("Save error:", error);
		}
	}

	async testVoice() {
		this.showMessage("Generating voice...");

		try {
			const response = await fetch(
				"http://localhost:3000/api/voice/generate",
				{
					method: "POST",
					headers: {
						"Content-Type":
							"application/json",
					},
					body: JSON.stringify({
						text: "Welcome to Stick RPG! This is a voice test.",
						voiceId: "21m00Tcm4TlvDq8ikWAM",
					}),
				},
			);

			if (response.ok) {
				const audioBlob = await response.blob();
				const audioUrl = URL.createObjectURL(audioBlob);
				const audio = new Audio(audioUrl);
				audio.play();
				this.showMessage("✓ Voice test successful!");
				console.log("✓ Voice test successful");
			} else {
				this.showMessage("✗ Voice generation failed");
				console.error("Voice generation failed");
			}
		} catch (error) {
			this.showMessage("✗ Voice error (backend offline?)");
			console.error("Voice test error:", error);
		}
	}

	update() {
		// Update player
		if (this.player) {
			this.player.update();
		}

		// Update time manager
		if (this.timeManager) {
			this.timeManager.update();
		}

		// Check if player is near an NPC
		if (this._npcOverlapping && this.currentNpcZone) {
			const npcName = this.currentNpcZone.getData("npcName");
			this.interactionPrompt.setText(
				`Press E to talk to ${npcName}`,
			);
			this.interactionPrompt.setVisible(true);
		} else {
			this.currentNpcZone = null;
			this.interactionPrompt.setVisible(false);
		}

		// Reset overlap flag each frame (overlap callback will re-set next frame)
		this._npcOverlapping = false;
	}

	/**
	 * Convert desired screen coordinates to world coordinates for scrollFactor(0) objects
	 */
	screenToWorld(screenX, screenY) {
		const zoom = this.cameras.main.zoom;
		const cx = this.cameras.main.width / 2;
		const cy = this.cameras.main.height / 2;
		return {
			x: cx + (screenX - cx) / zoom,
			y: cy + (screenY - cy) / zoom,
		};
	}

	shutdown() {
		// Clean up
		if (this.statsUI) {
			this.statsUI.destroy();
		}
		this.events.off("moneyChanged");
		this.events.off("timeUpdated");
	}
}
