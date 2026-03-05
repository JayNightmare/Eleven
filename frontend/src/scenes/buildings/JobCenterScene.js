import BuildingScene from "./BuildingScene.js";
import JobManager from "../../systems/JobManager.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Job Center - Find work and earn money
 */
export default class JobCenterScene extends BuildingScene {
	constructor() {
		super("JobCenterScene", "💼 JOB CENTER");
		this.buildingColor = 0x2c3e50;
	}

	init(data) {
		super.init(data);

		// Initialize JobManager
		this.jobManager = new JobManager(this);

		// Load job data if provided
		if (data.jobData) {
			this.jobManager.fromJSON(data.jobData);
		}
	}

	create() {
		super.create();

		// Create job center interior
		this.createInterior(0x2c3e50, 0x34495e); // Dark blue colors

		// Create title
		this.createCommonUI("Job Center", "💼");

		// Show current job status or job listings
		if (this.jobManager.hasJob()) {
			this.showCurrentJobPanel();
		} else {
			this.showJobListings();
		}

		// Create NPC
		this.createNPC();
	}

	/**
	 * Show current job panel (work, info, quit)
	 */
	showCurrentJobPanel() {
		const job = this.jobManager.getCurrentJob();

		// Job title
		const jobTitle = this.add
			.text(400, 120, `${job.icon} ${job.name}`, {
				fontSize: "32px",
				fontFamily: "Arial",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		// Job description
		const description = this.add
			.text(400, 160, job.description, {
				fontSize: "18px",
				fontFamily: "Arial",
				color: "#cccccc",
			})
			.setOrigin(0.5);

		// Days worked
		const daysText = this.add
			.text(400, 200, `Days Worked: ${job.daysSinceHired}`, {
				fontSize: "16px",
				fontFamily: "Arial",
				color: "#aaaaaa",
			})
			.setOrigin(0.5);

		// Job details panel
		const detailsY = 250;
		const detailsPanel = this.add
			.text(
				400,
				detailsY,
				`Pay: $${job.pay.daily} per shift (${job.workDuration} hours)\n` +
					`Energy Cost: ${job.energyCost}\n` +
					`Stat Gains: ${this.formatStatGains(job.statGains)}`,
				{
					fontSize: "16px",
					fontFamily: "Arial",
					color: "#ffffff",
					align: "center",
				},
			)
			.setOrigin(0.5);

		// Work button (large, prominent)
		this.createButton(
			300,
			360,
			200,
			60,
			"Work Shift",
			() => {
				this.workShift();
			},
			0x27ae60,
			0x2ecc71,
		);

		// View all jobs button
		this.createButton(
			300,
			440,
			200,
			50,
			"View All Jobs",
			() => {
				this.showJobListings();
			},
			0x3498db,
			0x5dade2,
		);

		// Quit job button (small, bottom)
		this.createButton(
			300,
			510,
			200,
			40,
			"Quit Job",
			() => {
				this.confirmQuitJob();
			},
			0xe74c3c,
			0xc0392b,
		);

		// Current stats display
		this.statsDisplay = this.createStatsDisplay(600, 250);
	}

	/**
	 * Show all available jobs
	 */
	showJobListings() {
		// Clear existing UI
		this.children.list.forEach((child) => {
			if (child.getData && child.getData("jobUI")) {
				child.destroy();
			}
		});

		// Title
		const title = this.add
			.text(400, 100, "Available Jobs", {
				fontSize: "28px",
				fontFamily: "Arial",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setData("jobUI", true);

		// Get all jobs sorted by tier
		const allJobs = this.jobManager.getAllJobs();
		const jobsByTier = {
			entry: allJobs.filter((j) => j.tier === "entry"),
			mid: allJobs.filter((j) => j.tier === "mid"),
			high: allJobs.filter((j) => j.tier === "high"),
		};

		let yOffset = 150;

		// Display jobs by tier
		for (const [tier, jobs] of Object.entries(jobsByTier)) {
			// Tier header
			const tierColors = {
				entry: "#95a5a6",
				mid: "#3498db",
				high: "#f39c12",
			};

			const tierNames = {
				entry: "Entry Level",
				mid: "Mid-Tier",
				high: "Executive",
			};

			this.add
				.text(400, yOffset, tierNames[tier], {
					fontSize: "20px",
					fontFamily: "Arial",
					color: tierColors[tier],
					fontStyle: "bold",
				})
				.setOrigin(0.5)
				.setData("jobUI", true);

			yOffset += 30;

			// Display each job in tier
			for (const job of jobs) {
				const canApply = this.jobManager.canGetJob(
					job.id,
					this.statsManager,
				);
				const hasThisJob =
					this.jobManager.currentJob === job.id;

				// Job button
				const buttonColor = hasThisJob
					? 0x27ae60
					: canApply
						? 0x3498db
						: 0x7f8c8d;
				const hoverColor = hasThisJob
					? 0x2ecc71
					: canApply
						? 0x5dade2
						: 0x95a5a6;

				const buttonText = hasThisJob
					? "✓ Current Job"
					: canApply
						? "Apply"
						: "Locked";

				const button = this.createButton(
					80,
					yOffset,
					150,
					35,
					`${job.icon} ${job.name}`,
					() => this.showJobDetails(job),
					buttonColor,
					hoverColor,
				).setData("jobUI", true);

				// Pay display
				this.add
					.text(
						650,
						yOffset,
						`$${job.pay.daily}/day`,
						{
							fontSize: "16px",
							fontFamily: "Arial",
							color: "#ffffff",
						},
					)
					.setOrigin(0.5)
					.setData("jobUI", true);

				// Apply/Status button
				if (!hasThisJob) {
					this.createButton(
						550,
						yOffset,
						80,
						35,
						buttonText,
						canApply
							? () =>
									this.applyForJob(
										job.id,
									)
							: null,
						buttonColor,
						hoverColor,
					).setData("jobUI", true);
				}

				yOffset += 45;
			}

			yOffset += 10; // Space between tiers
		}

		// Current stats display
		this.statsDisplay = this.createStatsDisplay(600, yOffset + 20);
	}

	/**
	 * Show detailed job information
	 */
	showJobDetails(job) {
		const canApply = this.jobManager.canGetJob(
			job.id,
			this.statsManager,
		);
		const missing = this.jobManager.getMissingRequirements(
			job.id,
			this.statsManager,
		);

		let message = `${job.icon} ${job.name}\n\n${job.description}\n\n`;
		message += `Pay: $${job.pay.daily} per shift (${job.workDuration} hours)\n`;
		message += `Energy Cost: ${job.energyCost}\n`;
		message += `Stat Gains: ${this.formatStatGains(job.statGains)}\n\n`;
		message += `Requirements:\n`;

		for (const [stat, required] of Object.entries(
			job.requirements,
		)) {
			if (required > 0) {
				const playerStat =
					this.statsManager.getStats()[stat];
				const checkmark =
					playerStat >= required ? "✓" : "✗";
				message += `${checkmark} ${this.capitalize(stat)}: ${required}\n`;
			}
		}

		if (!canApply && Object.keys(missing).length > 0) {
			message += `\nYou need:\n`;
			for (const [stat, amount] of Object.entries(missing)) {
				message += `+${amount} ${this.capitalize(stat)}\n`;
			}
		}

		this.showMessage(
			message,
			canApply ? "#2ecc71" : "#e74c3c",
			4000,
		);
	}

	/**
	 * Apply for a job
	 */
	applyForJob(jobId) {
		const result = this.jobManager.applyForJob(
			jobId,
			this.statsManager,
		);

		if (result.success) {
			this.showMessage(result.message, "#2ecc71");
			// Refresh to show current job panel
			this.time.delayedCall(1000, () => {
				this.showCurrentJobPanel();
			});
		} else {
			this.showMessage(result.message, "#e74c3c");
		}
	}

	/**
	 * Confirm quitting job
	 */
	confirmQuitJob() {
		const job = this.jobManager.getCurrentJob();

		if (
			confirm(
				`Are you sure you want to quit your job as ${job.name}?`,
			)
		) {
			const result = this.jobManager.quitJob();
			this.showMessage(result.message, "#e67e22");

			// Refresh to show job listings
			this.time.delayedCall(1000, () => {
				this.showJobListings();
			});
		}
	}

	/**
	 * Work a shift at current job
	 */
	workShift() {
		const result = this.jobManager.work(
			this.statsManager,
			this.timeManager,
		);

		if (result.success) {
			// Add money
			this.money += result.moneyEarned;

			// Show success message
			let message = `${result.message}\n`;
			message += `Time: +${result.timeSpent} hours\n`;
			if (result.statGains) {
				message += `Stats: ${this.formatStatGains(result.statGains)}`;
			}

			this.showMessage(message, "#2ecc71", 3000);

			// Update display
			this.time.delayedCall(500, () => {
				this.updateStatsDisplay();
			});
		} else {
			this.showMessage(result.message, "#e74c3c");
		}
	}

	/**
	 * Create stats display panel
	 */
	createStatsDisplay(x, y) {
		const stats = this.statsManager.getStats();
		const energy = this.timeManager.getEnergy();
		const time = this.timeManager.getTime();

		const panel = this.add.container(x, y).setData("jobUI", true);

		const bg = this.add.rectangle(0, 0, 180, 140, 0x2c3e50, 0.8);
		panel.add(bg);

		const title = this.add
			.text(0, -55, "Your Stats", {
				fontSize: "16px",
				fontFamily: "Arial",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		panel.add(title);

		const statsText = this.add
			.text(
				0,
				-20,
				`STR: ${stats.strength}  INT: ${stats.intelligence}\n` +
					`CHR: ${stats.charm}  END: ${stats.endurance}\n` +
					`Energy: ${Math.floor(energy)}\n` +
					`Time: ${time.hour}:00 Day ${time.day}`,
				{
					fontSize: "14px",
					fontFamily: "Arial",
					color: "#ecf0f1",
					align: "center",
				},
			)
			.setOrigin(0.5);
		panel.add(statsText);

		panel.statsText = statsText;

		return panel;
	}

	/**
	 * Update stats display
	 */
	updateStatsDisplay() {
		if (!this.statsDisplay || !this.statsDisplay.statsText) return;

		const stats = this.statsManager.getStats();
		const energy = this.timeManager.getEnergy();
		const time = this.timeManager.getTime();

		this.statsDisplay.statsText.setText(
			`STR: ${stats.strength}  INT: ${stats.intelligence}\n` +
				`CHR: ${stats.charm}  END: ${stats.endurance}\n` +
				`Energy: ${Math.floor(energy)}\n` +
				`Time: ${time.hour}:00 Day ${time.day}`,
		);
	}

	/**
	 * Refresh entire display
	 */
	refreshDisplay() {
		if (this.jobManager.hasJob()) {
			this.showCurrentJobPanel();
		} else {
			this.showJobListings();
		}
	}

	/**
	 * Format stat gains for display
	 */
	formatStatGains(statGains) {
		if (!statGains) return "None";

		const gains = [];
		for (const [stat, xp] of Object.entries(statGains)) {
			gains.push(
				`+${xp} ${this.capitalize(stat).slice(0, 3)}`,
			);
		}
		return gains.join(", ");
	}

	/**
	 * Capitalize first letter
	 */
	capitalize(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	/**
	 * Exit building and return job data
	 */
	exitBuilding() {
		const returnData = {
			...this.getReturnData(),
			jobData: this.jobManager.toJSON(),
		};

		this.scene.start("GameScene", returnData);
	}

	/**
	 * Create NPC (recruiter)
	 */
	createNPC() {
		const npcDef = getNPCById("recruiter");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side at reception desk)
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

				// Refresh displays if available
				if (this.updateStatsDisplay) {
					this.updateStatsDisplay();
				}
				if (this.updateMoneyDisplay) {
					this.updateMoneyDisplay();
				}
			},
		});
	}
}
