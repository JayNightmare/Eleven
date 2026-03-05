/**
 * NPC - Non-Player Character with personality and voice
 */
export default class NPC {
	constructor(data) {
		this.id = data.id;
		this.name = data.name;
		this.role = data.role; // Job title or role
		this.personality = data.personality; // Personality description
		this.voiceId = data.voiceId; // ElevenLabs voice ID
		this.location = data.location; // Building they're in
		this.sprite = null; // Visual representation
		this.dialogueTree = data.dialogueTree || {}; // Conversation options
		this.relationship = 0; // Player relationship level (-100 to 100)
		this.mood = data.mood || "neutral"; // Current mood
		this.backstory = data.backstory || ""; // Character background
	}

	/**
	 * Get greeting based on relationship and context
	 */
	getGreeting(context = {}) {
		const { timeOfDay, playerStats, firstMeeting } = context;

		if (firstMeeting) {
			return (
				this.dialogueTree.firstMeeting ||
				`Hello, I'm ${this.name}.`
			);
		}

		// Relationship-based greetings
		if (this.relationship > 50) {
			return (
				this.dialogueTree.greetingFriendly ||
				`Hey there, friend!`
			);
		} else if (this.relationship < -50) {
			return (
				this.dialogueTree.greetingHostile ||
				`What do you want?`
			);
		}

		return this.dialogueTree.greetingNeutral || `Hello.`;
	}

	/**
	 * Get dialogue options available to player
	 */
	getDialogueOptions(context = {}) {
		const options = [];

		// Base options always available
		if (this.dialogueTree.options) {
			this.dialogueTree.options.forEach((option) => {
				// Check if option is available based on requirements
				if (this.isOptionAvailable(option, context)) {
					options.push(option);
				}
			});
		}

		return options;
	}

	/**
	 * Check if dialogue option is available to player
	 */
	isOptionAvailable(option, context) {
		// Check stat requirements
		if (option.requires) {
			const { stats, relationship, items } = context;

			// Stat requirements
			if (option.requires.stats) {
				for (const [stat, value] of Object.entries(
					option.requires.stats,
				)) {
					if (!stats || stats[stat] < value) {
						return false;
					}
				}
			}

			// Relationship requirements
			if (option.requires.relationship !== undefined) {
				if (
					this.relationship <
					option.requires.relationship
				) {
					return false;
				}
			}

			// Item requirements
			if (option.requires.items) {
				// TODO: Check player inventory
			}
		}

		return true;
	}

	/**
	 * Process player's dialogue choice
	 */
	respond(optionId, context = {}) {
		const option = this.dialogueTree.options?.find(
			(opt) => opt.id === optionId,
		);

		if (!option) {
			return {
				text: "...",
				voiceId: this.voiceId,
			};
		}

		// Update relationship based on option
		if (option.relationshipChange) {
			this.relationship += option.relationshipChange;
			this.relationship = Math.max(
				-100,
				Math.min(100, this.relationship),
			);
		}

		// Get response text
		const responseText = option.response || "Interesting.";

		// Handle option effects
		const effects = option.effects || {};

		return {
			text: responseText,
			voiceId: this.voiceId,
			effects: effects,
			nextOptions: option.nextOptions || null,
		};
	}

	/**
	 * Update NPC mood based on context
	 */
	updateMood(context = {}) {
		const { timeOfDay, playerActions } = context;

		// Simple mood system
		if (this.relationship > 70) {
			this.mood = "happy";
		} else if (this.relationship < -30) {
			this.mood = "angry";
		} else if (timeOfDay === "night") {
			this.mood = "tired";
		} else {
			this.mood = "neutral";
		}
	}

	/**
	 * Get NPC appearance data for rendering
	 */
	getAppearance() {
		return {
			color: this.getColorForRole(),
			icon: this.getIconForRole(),
			scale: 1.0,
		};
	}

	/**
	 * Get color based on NPC role
	 */
	getColorForRole() {
		const roleColors = {
			trainer: 0xff6b6b,
			bartender: 0xf7b731,
			shopkeeper: 0x4ecdc4,
			professor: 0x5f27cd,
			landlord: 0x45b7d1,
			banker: 0x26de81,
			recruiter: 0x2c3e50,
		};

		return roleColors[this.role] || 0xcccccc;
	}

	/**
	 * Get icon emoji based on NPC role
	 */
	getIconForRole() {
		const roleIcons = {
			trainer: "💪",
			bartender: "🍺",
			shopkeeper: "🛒",
			professor: "📚",
			landlord: "🏠",
			banker: "💼",
			recruiter: "👔",
		};

		return roleIcons[this.role] || "👤";
	}

	/**
	 * Serialize NPC data for saving
	 */
	toJSON() {
		return {
			id: this.id,
			relationship: this.relationship,
			mood: this.mood,
		};
	}

	/**
	 * Load NPC data from save
	 */
	fromJSON(data) {
		this.relationship = data.relationship || 0;
		this.mood = data.mood || "neutral";
	}
}
