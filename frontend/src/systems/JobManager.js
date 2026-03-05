/**
 * Job Manager - Handles jobs, career progression, and income
 */
export default class JobManager {
	constructor(scene) {
		this.scene = scene;

		// Current job
		this.currentJob = null;
		this.daysSinceHired = 0;

		// All available jobs with requirements and pay
		this.jobs = this.defineJobs();
	}

	/**
	 * Define all available jobs in the game
	 */
	defineJobs() {
		return {
			// === ENTRY LEVEL JOBS (No requirements) ===
			constructionWorker: {
				id: "constructionWorker",
				name: "Construction Worker",
				description:
					"Hard physical labor building things",
				tier: "entry",
				icon: "🔨",
				requirements: {
					strength: 0,
					intelligence: 0,
					charm: 0,
					endurance: 0,
				},
				pay: {
					hourly: 15, // $15/hour
					daily: 120, // 8 hour day
				},
				workDuration: 8, // hours
				energyCost: 30,
				statGains: {
					strength: 5,
					endurance: 5,
				},
			},

			cashier: {
				id: "cashier",
				name: "Store Cashier",
				description:
					"Ring up customers at the register",
				tier: "entry",
				icon: "💰",
				requirements: {
					strength: 0,
					intelligence: 0,
					charm: 0,
					endurance: 0,
				},
				pay: {
					hourly: 12,
					daily: 96,
				},
				workDuration: 8,
				energyCost: 15,
				statGains: {
					charm: 3,
				},
			},

			tutor: {
				id: "tutor",
				name: "Private Tutor",
				description: "Help students with homework",
				tier: "entry",
				icon: "📝",
				requirements: {
					strength: 0,
					intelligence: 2,
					charm: 0,
					endurance: 0,
				},
				pay: {
					hourly: 18,
					daily: 72, // 4 hour day (part-time)
				},
				workDuration: 4,
				energyCost: 10,
				statGains: {
					intelligence: 5,
					charm: 2,
				},
			},

			// === MID-TIER JOBS (Moderate requirements) ===
			mechanic: {
				id: "mechanic",
				name: "Auto Mechanic",
				description: "Fix cars and vehicles",
				tier: "mid",
				icon: "🔧",
				requirements: {
					strength: 5,
					intelligence: 3,
					charm: 0,
					endurance: 4,
				},
				pay: {
					hourly: 25,
					daily: 200,
				},
				workDuration: 8,
				energyCost: 25,
				statGains: {
					strength: 8,
					intelligence: 5,
				},
			},

			salesperson: {
				id: "salesperson",
				name: "Sales Representative",
				description: "Sell products to customers",
				tier: "mid",
				icon: "💼",
				requirements: {
					strength: 0,
					intelligence: 3,
					charm: 5,
					endurance: 0,
				},
				pay: {
					hourly: 22,
					daily: 176,
				},
				workDuration: 8,
				energyCost: 20,
				statGains: {
					charm: 10,
					intelligence: 3,
				},
			},

			accountant: {
				id: "accountant",
				name: "Accountant",
				description: "Manage finances and books",
				tier: "mid",
				icon: "📊",
				requirements: {
					strength: 0,
					intelligence: 6,
					charm: 2,
					endurance: 0,
				},
				pay: {
					hourly: 30,
					daily: 240,
				},
				workDuration: 8,
				energyCost: 15,
				statGains: {
					intelligence: 10,
				},
			},

			// === HIGH-TIER JOBS (High requirements) ===
			ceo: {
				id: "ceo",
				name: "CEO",
				description: "Run a major corporation",
				tier: "high",
				icon: "👔",
				requirements: {
					strength: 0,
					intelligence: 10,
					charm: 10,
					endurance: 5,
				},
				pay: {
					hourly: 100,
					daily: 800,
				},
				workDuration: 8,
				energyCost: 25,
				statGains: {
					intelligence: 15,
					charm: 15,
				},
			},

			scientist: {
				id: "scientist",
				name: "Research Scientist",
				description: "Conduct advanced research",
				tier: "high",
				icon: "🔬",
				requirements: {
					strength: 0,
					intelligence: 12,
					charm: 3,
					endurance: 3,
				},
				pay: {
					hourly: 80,
					daily: 640,
				},
				workDuration: 8,
				energyCost: 20,
				statGains: {
					intelligence: 20,
				},
			},
		};
	}

	/**
	 * Get all jobs as an array
	 */
	getAllJobs() {
		return Object.values(this.jobs);
	}

	/**
	 * Get jobs by tier
	 */
	getJobsByTier(tier) {
		return this.getAllJobs().filter((job) => job.tier === tier);
	}

	/**
	 * Check if player can get a job (meets requirements)
	 */
	canGetJob(jobId, statsManager) {
		const job = this.jobs[jobId];
		if (!job) return false;

		const playerStats = statsManager.getStats();

		// Check all stat requirements
		for (const [stat, required] of Object.entries(
			job.requirements,
		)) {
			if (playerStats[stat] < required) {
				return false;
			}
		}

		return true;
	}

	/**
	 * Get list of jobs available to player (meets requirements)
	 */
	getAvailableJobs(statsManager) {
		return this.getAllJobs().filter((job) =>
			this.canGetJob(job.id, statsManager),
		);
	}

	/**
	 * Get missing requirements for a job
	 */
	getMissingRequirements(jobId, statsManager) {
		const job = this.jobs[jobId];
		if (!job) return {};

		const playerStats = statsManager.getStats();
		const missing = {};

		for (const [stat, required] of Object.entries(
			job.requirements,
		)) {
			if (playerStats[stat] < required) {
				missing[stat] = required - playerStats[stat];
			}
		}

		return missing;
	}

	/**
	 * Apply for a job
	 */
	applyForJob(jobId, statsManager) {
		if (!this.canGetJob(jobId, statsManager)) {
			return {
				success: false,
				message: "You don't meet the requirements for this job.",
			};
		}

		const job = this.jobs[jobId];
		this.currentJob = jobId;
		this.daysSinceHired = 0;

		return {
			success: true,
			message: `Congratulations! You're now a ${job.name}!`,
			job: job,
		};
	}

	/**
	 * Quit current job
	 */
	quitJob() {
		if (!this.currentJob) {
			return {
				success: false,
				message: "You don't have a job to quit.",
			};
		}

		const oldJob = this.jobs[this.currentJob];
		this.currentJob = null;
		this.daysSinceHired = 0;

		return {
			success: true,
			message: `You quit your job as ${oldJob.name}.`,
		};
	}

	/**
	 * Work at current job
	 */
	work(statsManager, timeManager) {
		if (!this.currentJob) {
			return {
				success: false,
				message: "You don't have a job!",
			};
		}

		const job = this.jobs[this.currentJob];

		// Check if player has enough energy
		if (timeManager.getEnergy() < job.energyCost) {
			return {
				success: false,
				message: "Not enough energy to work!",
			};
		}

		// Perform work
		const moneyEarned = job.pay.daily;

		// Advance time
		for (let i = 0; i < job.workDuration; i++) {
			timeManager.advanceTime(60); // 1 hour per iteration
		}

		// Deplete energy
		timeManager.depleteEnergy(job.energyCost);

		// Gain stats from work
		if (job.statGains) {
			for (const [stat, xp] of Object.entries(
				job.statGains,
			)) {
				statsManager.addExperience(stat, xp);
			}
		}

		// Track days worked
		this.daysSinceHired++;

		return {
			success: true,
			message: `Work complete! Earned $${moneyEarned}`,
			moneyEarned: moneyEarned,
			statGains: job.statGains,
			timeSpent: job.workDuration,
		};
	}

	/**
	 * Get current job details
	 */
	getCurrentJob() {
		if (!this.currentJob) return null;
		return {
			...this.jobs[this.currentJob],
			daysSinceHired: this.daysSinceHired,
		};
	}

	/**
	 * Check if player has a job
	 */
	hasJob() {
		return this.currentJob !== null;
	}

	/**
	 * Serialize job data for saving
	 */
	toJSON() {
		return {
			currentJob: this.currentJob,
			daysSinceHired: this.daysSinceHired,
		};
	}

	/**
	 * Load job data from save
	 */
	fromJSON(data) {
		this.currentJob = data.currentJob || null;
		this.daysSinceHired = data.daysSinceHired || 0;
	}
}
