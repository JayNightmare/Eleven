/**
 * Time Manager - Handles in-game time, day/night cycle
 */
export default class TimeManager {
	constructor(scene) {
		this.scene = scene;

		// Time tracking
		this.currentDay = 1;
		this.currentHour = 8; // Start at 8 AM
		this.currentMinute = 0;

		// Time settings
		this.hoursPerDay = 24;
		this.minutesPerHour = 60;

		// Real-time to game-time conversion (1 real second = X game minutes)
		this.timeScale = 1; // Can adjust for faster/slower time

		// Pause time advancement (for menus, dialogues, etc.)
		this.paused = false;

		// Energy system
		this.energy = 100;
		this.maxEnergy = 100;
		this.energyDepletionRate = 0.5; // Energy lost per game hour
	}

	/**
	 * Advance time by minutes
	 */
	advanceTime(minutes) {
		if (this.paused) return;

		this.currentMinute += minutes;

		// Handle hour rollover
		while (this.currentMinute >= this.minutesPerHour) {
			this.currentMinute -= this.minutesPerHour;
			this.currentHour++;

			// Deplete energy
			this.energy = Math.max(
				0,
				this.energy - this.energyDepletionRate,
			);

			// Emit hour change event
			this.scene.events.emit("hourChanged", this.currentHour);
		}

		// Handle day rollover
		while (this.currentHour >= this.hoursPerDay) {
			this.currentHour -= this.hoursPerDay;
			this.currentDay++;

			// Emit day change event
			this.scene.events.emit("dayChanged", this.currentDay);
		}

		// Emit general time update
		this.scene.events.emit("timeUpdated", this.getTimeString());

		// Check if player needs to sleep
		if (this.energy <= 10) {
			this.scene.events.emit("lowEnergy");
		}
	}

	/**
	 * Sleep - restore energy and advance to next day
	 */
	sleep(energyRestored) {
		// Restore energy (default to max, or use custom amount)
		this.energy = Math.min(
			this.maxEnergy,
			energyRestored || this.maxEnergy,
		);

		// Advance to next morning (8 AM)
		const hoursUntilMorning =
			this.currentHour < 8
				? 8 - this.currentHour
				: 24 - this.currentHour + 8;
		this.advanceTime(hoursUntilMorning * 60);

		console.log(`💤 Slept until Day ${this.currentDay}, 8:00 AM`);
		this.scene.events.emit("slept", {
			day: this.currentDay,
			energy: this.energy,
		});

		return true;
	}

	/**
	 * Get formatted time string
	 */
	getTimeString() {
		const hour12 = this.currentHour % 12 || 12;
		const ampm = this.currentHour < 12 ? "AM" : "PM";
		const minute = this.currentMinute.toString().padStart(2, "0");
		return `${hour12}:${minute} ${ampm}`;
	}

	/**
	 * Get day string
	 */
	getDayString() {
		return `Day ${this.currentDay}`;
	}

	/**
	 * Get current day number
	 */
	get day() {
		return this.currentDay;
	}

	/**
	 * Check if it's daytime (6 AM - 6 PM)
	 */
	isDaytime() {
		return this.currentHour >= 6 && this.currentHour < 18;
	}

	/**
	 * Check if it's nighttime
	 */
	isNighttime() {
		return !this.isDaytime();
	}

	/**
	 * Get time of day as a string for context
	 * @returns {string} "morning", "afternoon", "evening", or "night"
	 */
	getTimeOfDay() {
		const hour = this.currentHour;

		if (hour >= 6 && hour < 12) {
			return "morning";
		} else if (hour >= 12 && hour < 18) {
			return "afternoon";
		} else if (hour >= 18 && hour < 22) {
			return "evening";
		} else {
			return "night";
		}
	}

	/**
	 * Pause time advancement
	 */
	pause() {
		this.paused = true;
	}

	/**
	 * Resume time advancement
	 */
	resume() {
		this.paused = false;
	}

	/**
	 * Restore energy (from items, etc.)
	 */
	restoreEnergy(amount) {
		this.energy = Math.min(this.maxEnergy, this.energy + amount);
		this.scene.events.emit("energyRestored", this.energy);
	}

	/**
	 * Drain energy (from activities)
	 */
	drainEnergy(amount) {
		this.energy = Math.max(0, this.energy - amount);

		if (this.energy <= 10 && this.energy + amount > 10) {
			this.scene.events.emit("lowEnergy");
		}
	}

	/**
	 * Deplete energy (alias for drainEnergy)
	 */
	depleteEnergy(amount) {
		this.drainEnergy(amount);
	}

	/**
	 * Get current energy
	 */
	getEnergy() {
		return this.energy;
	}

	/**
	 * Check if player has enough energy
	 */
	hasEnergy(required) {
		return this.energy >= required;
	}

	/**
	 * Update loop (called every frame)
	 */
	update(delta) {
		// Optionally advance time automatically in real-time
		// For now, time only advances when performing actions
	}

	/**
	 * Serialize time data for saving
	 */
	toJSON() {
		return {
			currentDay: this.currentDay,
			currentHour: this.currentHour,
			currentMinute: this.currentMinute,
			energy: this.energy,
			maxEnergy: this.maxEnergy,
		};
	}

	/**
	 * Load time data from save
	 */
	fromJSON(data) {
		this.currentDay = data.currentDay;
		this.currentHour = data.currentHour;
		this.currentMinute = data.currentMinute;
		this.energy = data.energy;
		this.maxEnergy = data.maxEnergy;
	}
}
