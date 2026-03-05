/**
 * Stats Manager - Tracks and manages player stats
 */
export default class StatsManager {
	constructor(scene) {
		this.scene = scene;

		// Initialize stats
		this.stats = {
			strength: 1,
			intelligence: 1,
			charm: 1,
			endurance: 1,
		};

		// Experience points for each stat
		this.experience = {
			strength: 0,
			intelligence: 0,
			charm: 0,
			endurance: 0,
		};

		// XP required for next level (exponential scaling)
		this.xpToNextLevel = {
			strength: 100,
			intelligence: 100,
			charm: 100,
			endurance: 100,
		};
	}

	/**
	 * Add experience to a stat
	 */
	addExperience(stat, amount) {
		if (!this.stats.hasOwnProperty(stat)) {
			console.error(`Invalid stat: ${stat}`);
			return;
		}

		this.experience[stat] += amount;

		// Check for level up
		while (this.experience[stat] >= this.xpToNextLevel[stat]) {
			this.levelUp(stat);
		}
	}

	/**
	 * Level up a stat
	 */
	levelUp(stat) {
		const oldLevel = this.stats[stat];
		this.stats[stat]++;
		this.experience[stat] -= this.xpToNextLevel[stat];

		// Increase XP requirement (exponential scaling: 1.5x per level)
		this.xpToNextLevel[stat] = Math.floor(
			this.xpToNextLevel[stat] * 1.5,
		);

		console.log(
			`💪 ${stat.toUpperCase()} Level Up! ${oldLevel} → ${this.stats[stat]}`,
		);

		// Emit event for UI updates
		this.scene.events.emit("statLevelUp", {
			stat,
			level: this.stats[stat],
		});
	}

	/**
	 * Manually set stat level (for loading save games)
	 */
	setStat(stat, level, xp = 0) {
		if (!this.stats.hasOwnProperty(stat)) {
			console.error(`Invalid stat: ${stat}`);
			return;
		}

		this.stats[stat] = level;
		this.experience[stat] = xp;

		// Recalculate XP requirement based on level
		this.xpToNextLevel[stat] = Math.floor(
			100 * Math.pow(1.5, level - 1),
		);
	}

	/**
	 * Get current stat level
	 */
	getStat(stat) {
		return this.stats[stat] || 0;
	}

	/**
	 * Get all stats
	 */
	getAllStats() {
		return { ...this.stats };
	}

	/**
	 * Get stats (alias for getAllStats)
	 */
	getStats() {
		return this.getAllStats();
	}

	/**
	 * Get all experience values
	 */
	getExperience() {
		return { ...this.experience };
	}

	/**
	 * Get all XP to next level values
	 */
	getXPToNextLevel() {
		return { ...this.xpToNextLevel };
	}

	/**
	 * Get stat progress (for progress bars)
	 */
	getStatProgress(stat) {
		return {
			current: this.experience[stat],
			required: this.xpToNextLevel[stat],
			percentage:
				(this.experience[stat] /
					this.xpToNextLevel[stat]) *
				100,
		};
	}

	/**
	 * Check if player meets stat requirement
	 */
	meetsRequirement(requirements) {
		for (const [stat, required] of Object.entries(requirements)) {
			if (this.stats[stat] < required) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Serialize stats for saving
	 */
	toJSON() {
		return {
			stats: { ...this.stats },
			experience: { ...this.experience },
			xpToNextLevel: { ...this.xpToNextLevel },
		};
	}

	/**
	 * Load stats from save data
	 */
	fromJSON(data) {
		this.stats = { ...data.stats };
		this.experience = { ...data.experience };
		this.xpToNextLevel = { ...data.xpToNextLevel };
	}
}
