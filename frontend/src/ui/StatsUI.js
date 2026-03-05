/**
 * Stats UI - HUD displaying stats, money, time, energy
 */
export default class StatsUI {
	constructor(scene) {
		this.scene = scene;

		// Compute zoom-compensated container position
		// Formula: containerPos = camCenter * (1 - 1/zoom)
		// This makes child local coordinates map directly to screen coordinates
		const zoom = scene.cameras.main.zoom || 1;
		const cx = scene.cameras.main.width / 2;
		const cy = scene.cameras.main.height / 2;
		const containerX = cx * (1 - 1 / zoom);
		const containerY = cy * (1 - 1 / zoom);

		this.container = scene.add.container(containerX, containerY);
		this.container.setScrollFactor(0);
		this.container.setDepth(1000);
		this.container.setScale(1 / zoom);

		this.createUI();
		this.setupEventListeners();
	}

	createUI() {
		const padding = 10;
		const panelWidth = 200;
		const panelHeight = 185;

		// Stats panel background
		this.statsPanel = this.scene.add.rectangle(
			padding,
			padding,
			panelWidth,
			panelHeight,
			0x000000,
			0.7,
		);
		this.statsPanel.setOrigin(0, 0);
		this.statsPanel.setStrokeStyle(2, 0xffffff, 0.8);
		this.container.add(this.statsPanel);

		// Title
		this.titleText = this.scene.add.text(
			padding + 10,
			padding + 8,
			"STATS",
			{
				fontSize: 16,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#4ecdc4",
			},
		);
		this.container.add(this.titleText);

		// Icon graphics
		this.iconGraphics = this.scene.add.graphics();
		this.container.add(this.iconGraphics);

		// Stats text with drawn icons
		let yOffset = padding + 35;
		const iconX = padding + 12;
		const textX = padding + 30;
		const lineHeight = 24;

		// Strength - red dumbbell icon
		this.drawDumbbell(iconX, yOffset + 3);
		this.strengthText = this.scene.add.text(
			textX,
			yOffset,
			"STR: 1",
			{ fontSize: 14, fontFamily: "Arial", color: "#ff6b6b" },
		);
		this.container.add(this.strengthText);
		yOffset += lineHeight;

		// Intelligence - blue diamond icon
		this.drawDiamond(iconX + 6, yOffset + 7, 0x45b7d1);
		this.intelligenceText = this.scene.add.text(
			textX,
			yOffset,
			"INT: 1",
			{ fontSize: 14, fontFamily: "Arial", color: "#45b7d1" },
		);
		this.container.add(this.intelligenceText);
		yOffset += lineHeight;

		// Charm - gold star icon
		this.drawStar(iconX + 6, yOffset + 7, 5, 0xf7b731);
		this.charmText = this.scene.add.text(textX, yOffset, "CHR: 1", {
			fontSize: 14,
			fontFamily: "Arial",
			color: "#f7b731",
		});
		this.container.add(this.charmText);
		yOffset += lineHeight;

		// Endurance - pink heart icon
		this.drawHeart(iconX + 6, yOffset + 3, 0xff6b6b);
		this.enduranceText = this.scene.add.text(
			textX,
			yOffset,
			"END: 1",
			{ fontSize: 14, fontFamily: "Arial", color: "#ff6b6b" },
		);
		this.container.add(this.enduranceText);
		yOffset += lineHeight + 8;

		// Money - green coin icon
		this.drawCoin(iconX + 6, yOffset + 7, 0x2ecc71);
		this.moneyText = this.scene.add.text(textX, yOffset, "$100", {
			fontSize: 16,
			fontFamily: "Arial",
			fontStyle: "bold",
			color: "#2ecc71",
		});
		this.container.add(this.moneyText);

		// Time panel (top right)
		const timeX =
			this.scene.cameras.main.width - panelWidth - padding;

		this.timePanel = this.scene.add.rectangle(
			timeX,
			padding,
			panelWidth,
			100,
			0x000000,
			0.7,
		);
		this.timePanel.setOrigin(0, 0);
		this.timePanel.setStrokeStyle(2, 0xffffff, 0.8);
		this.container.add(this.timePanel);

		// Day text
		this.dayText = this.scene.add.text(
			timeX + 10,
			padding + 10,
			"Day 1",
			{
				fontSize: 16,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
			},
		);
		this.container.add(this.dayText);

		// Time text
		this.timeText = this.scene.add.text(
			timeX + 10,
			padding + 35,
			"8:00 AM",
			{
				fontSize: 16,
				fontFamily: "Arial",
				color: "#ffffff",
			},
		);
		this.container.add(this.timeText);

		// Energy bar
		this.energyBarBg = this.scene.add.rectangle(
			timeX + 10,
			padding + 65,
			panelWidth - 20,
			15,
			0x333333,
		);
		this.energyBarBg.setOrigin(0, 0);
		this.container.add(this.energyBarBg);

		this.energyBarFill = this.scene.add.rectangle(
			timeX + 10,
			padding + 65,
			panelWidth - 20,
			15,
			0x45b7d1,
		);
		this.energyBarFill.setOrigin(0, 0);
		this.container.add(this.energyBarFill);

		this.energyText = this.scene.add
			.text(
				timeX + panelWidth / 2,
				padding + 63,
				"Energy: 100",
				{
					fontSize: 12,
					fontFamily: "Arial",
					color: "#ffffff",
				},
			)
			.setOrigin(0.5, 0);
		this.container.add(this.energyText);
	}

	setupEventListeners() {
		// Update stats when they change
		this.scene.events.on("statLevelUp", (data) => {
			this.updateStats();
		});

		this.scene.events.on("timeUpdated", () => {
			this.updateTime();
		});

		this.scene.events.on("dayChanged", () => {
			this.updateTime();
		});

		this.scene.events.on("energyRestored", () => {
			this.updateEnergy();
		});

		this.scene.events.on("lowEnergy", () => {
			// Flash energy bar red
			this.scene.tweens.add({
				targets: this.energyBarFill,
				alpha: 0.3,
				duration: 300,
				yoyo: true,
				repeat: 3,
			});
		});
	}

	/**
	 * Update stats display
	 */
	updateStats() {
		const statsManager = this.scene.statsManager;
		if (!statsManager) return;

		const stats = statsManager.getAllStats();
		this.strengthText.setText(`STR: ${stats.strength}`);
		this.intelligenceText.setText(`INT: ${stats.intelligence}`);
		this.charmText.setText(`CHR: ${stats.charm}`);
		this.enduranceText.setText(`END: ${stats.endurance}`);
	}

	/**
	 * Update money display
	 */
	updateMoney(amount) {
		this.moneyText.setText(`$${amount}`);
	}

	/**
	 * Update time display
	 */
	updateTime() {
		const timeManager = this.scene.timeManager;
		if (!timeManager) return;

		this.dayText.setText(`${timeManager.getDayString()}`);
		this.timeText.setText(`${timeManager.getTimeString()}`);
	}

	/**
	 * Update energy bar
	 */
	updateEnergy() {
		const timeManager = this.scene.timeManager;
		if (!timeManager) return;

		const energyPercent =
			timeManager.energy / timeManager.maxEnergy;
		this.energyBarFill.setScale(energyPercent, 1);
		this.energyText.setText(
			`Energy: ${Math.floor(timeManager.energy)}`,
		);

		// Change color based on energy level
		if (energyPercent > 0.5) {
			this.energyBarFill.setFillStyle(0x45b7d1);
		} else if (energyPercent > 0.25) {
			this.energyBarFill.setFillStyle(0xf7b731);
		} else {
			this.energyBarFill.setFillStyle(0xff6b6b);
		}
	}

	/**
	 * Hide UI
	 */
	hide() {
		this.container.setVisible(false);
	}

	/**
	 * Show UI
	 */
	show() {
		this.container.setVisible(true);
	}

	// --- Icon drawing methods ---

	drawDumbbell(x, y) {
		const g = this.iconGraphics;
		g.fillStyle(0xff6b6b);
		g.fillRect(x, y, 3, 8);
		g.fillRect(x + 3, y + 2, 8, 4);
		g.fillRect(x + 11, y, 3, 8);
	}

	drawDiamond(cx, cy, color) {
		const g = this.iconGraphics;
		g.fillStyle(color);
		const s = 5;
		g.fillTriangle(cx, cy - s, cx - s, cy, cx + s, cy);
		g.fillTriangle(cx - s, cy, cx + s, cy, cx, cy + s);
	}

	drawStar(cx, cy, r, color) {
		const g = this.iconGraphics;
		g.fillStyle(color);
		const points = [];
		for (let i = 0; i < 5; i++) {
			const outer = ((i * 72 - 90) * Math.PI) / 180;
			points.push({
				x: cx + Math.cos(outer) * r,
				y: cy + Math.sin(outer) * r,
			});
			const inner = ((i * 72 + 36 - 90) * Math.PI) / 180;
			points.push({
				x: cx + Math.cos(inner) * r * 0.4,
				y: cy + Math.sin(inner) * r * 0.4,
			});
		}
		g.fillPoints(points, true);
	}

	drawHeart(cx, cy, color) {
		const g = this.iconGraphics;
		g.fillStyle(color);
		g.fillCircle(cx - 3, cy + 1, 3.5);
		g.fillCircle(cx + 3, cy + 1, 3.5);
		g.fillTriangle(cx - 6, cy + 2, cx + 6, cy + 2, cx, cy + 9);
	}

	drawCoin(cx, cy, color) {
		const g = this.iconGraphics;
		g.fillStyle(color);
		g.fillCircle(cx, cy, 6);
		g.lineStyle(1.5, 0xffffff, 0.9);
		g.strokeCircle(cx, cy, 6);
	}

	/**
	 * Clean up
	 */
	destroy() {
		this.scene.events.off("statLevelUp");
		this.scene.events.off("timeUpdated");
		this.scene.events.off("dayChanged");
		this.scene.events.off("energyRestored");
		this.scene.events.off("lowEnergy");
		this.container.destroy();
	}
}
