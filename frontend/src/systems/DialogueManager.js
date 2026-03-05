/**
 * Dialogue Manager - Handles conversations between player and NPCs
 */
export default class DialogueManager {
	constructor(scene) {
		this.scene = scene;
		this.currentNPC = null;
		this.conversationState = null;
		this.conversationHistory = [];
	}

	/**
	 * Start a conversation with an NPC
	 */
	startConversation(npc, context = {}) {
		this.currentNPC = npc;
		this.conversationState = {
			firstMeeting: !this.hasMetBefore(npc.id),
			context: context,
			startTime: Date.now(),
		};

		// Update NPC mood based on context
		npc.updateMood(context);

		// Get greeting
		const greeting = npc.getGreeting({
			...context,
			firstMeeting: this.conversationState.firstMeeting,
		});

		// Mark as met
		if (this.conversationState.firstMeeting) {
			this.markAsMet(npc.id);
		}

		return {
			npc: npc,
			text: greeting,
			voiceId: npc.voiceId,
			options: npc.getDialogueOptions(context),
		};
	}

	/**
	 * Player selects a dialogue option
	 */
	selectOption(optionId) {
		if (!this.currentNPC) {
			console.error("No active conversation");
			return null;
		}

		// Get NPC response
		const response = this.currentNPC.respond(
			optionId,
			this.conversationState.context,
		);

		// Record in history
		this.conversationHistory.push({
			npcId: this.currentNPC.id,
			optionId: optionId,
			timestamp: Date.now(),
			relationshipAfter: this.currentNPC.relationship,
		});

		// Get next dialogue options
		let nextOptions;
		if (response.nextOptions) {
			// Specific follow-up options
			nextOptions = response.nextOptions;
		} else {
			// Back to main options
			nextOptions = this.currentNPC.getDialogueOptions(
				this.conversationState.context,
			);
		}

		return {
			text: response.text,
			voiceId: response.voiceId,
			effects: response.effects,
			options: nextOptions,
			relationship: this.currentNPC.relationship,
		};
	}

	/**
	 * End current conversation
	 */
	endConversation() {
		const npc = this.currentNPC;
		this.currentNPC = null;
		this.conversationState = null;

		return {
			npcId: npc?.id,
			relationship: npc?.relationship,
		};
	}

	/**
	 * Check if player has met NPC before
	 */
	hasMetBefore(npcId) {
		// Check localStorage for met NPCs
		const metNPCs = this.getMetNPCs();
		return metNPCs.includes(npcId);
	}

	/**
	 * Mark NPC as met
	 */
	markAsMet(npcId) {
		const metNPCs = this.getMetNPCs();
		if (!metNPCs.includes(npcId)) {
			metNPCs.push(npcId);
			localStorage.setItem(
				"metNPCs",
				JSON.stringify(metNPCs),
			);
		}
	}

	/**
	 * Get list of met NPCs
	 */
	getMetNPCs() {
		const stored = localStorage.getItem("metNPCs");
		return stored ? JSON.parse(stored) : [];
	}

	/**
	 * Get conversation history with NPC
	 */
	getHistory(npcId) {
		return this.conversationHistory.filter(
			(h) => h.npcId === npcId,
		);
	}

	/**
	 * Get relationship level with NPC
	 */
	getRelationship(npcId) {
		// Would need to track this in save data
		return 0;
	}

	/**
	 * Clear all conversation data (for new game)
	 */
	reset() {
		this.currentNPC = null;
		this.conversationState = null;
		this.conversationHistory = [];
		localStorage.removeItem("metNPCs");
	}

	/**
	 * Serialize for saving
	 */
	toJSON() {
		return {
			conversationHistory: this.conversationHistory,
			metNPCs: this.getMetNPCs(),
		};
	}

	/**
	 * Load from save
	 */
	fromJSON(data) {
		this.conversationHistory = data.conversationHistory || [];
		if (data.metNPCs) {
			localStorage.setItem(
				"metNPCs",
				JSON.stringify(data.metNPCs),
			);
		}
	}
}
