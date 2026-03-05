import Phaser from "phaser";
import { phaserConfig, gameConfig } from "./config.js";
import MenuScene from "./scenes/MenuScene.js";
import GameScene from "./scenes/GameScene.js";
import DialogueScene from "./scenes/DialogueScene.js";
import GymScene from "./scenes/buildings/GymScene.js";
import UniversityScene from "./scenes/buildings/UniversityScene.js";
import BarScene from "./scenes/buildings/BarScene.js";
import StoreScene from "./scenes/buildings/StoreScene.js";
import ApartmentScene from "./scenes/buildings/ApartmentScene.js";
import BankScene from "./scenes/buildings/BankScene.js";
import JobCenterScene from "./scenes/buildings/JobCenterScene.js";

// Add scenes to config
phaserConfig.scene = [
	MenuScene,
	GameScene,
	DialogueScene,
	GymScene,
	UniversityScene,
	BarScene,
	StoreScene,
	ApartmentScene,
	BankScene,
	JobCenterScene,
];

// Create game instance
const game = new Phaser.Game(phaserConfig);

console.log("🎮 Stick RPG Game initialized");
console.log("📡 API Base URL:", gameConfig.api.baseUrl);
console.log("🔊 Voice enabled:", gameConfig.voice.enabled);
