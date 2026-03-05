import BuildingScene from "./BuildingScene.js";
import NPC from "../../entities/NPC.js";
import { getNPCById } from "../../data/NPCDefinitions.js";

/**
 * Bank Scene - Money management and loans
 */
export default class BankScene extends BuildingScene {
	constructor() {
		super("BankScene", "🏦 THE BANK");
		this.buildingColor = 0x22c55e; // Green
	}

	init(data) {
		super.init(data);
		// Initialize loan data
		this.loanData = data.loanData || {
			active: false,
			amount: 0,
			interest: 0,
			dueDay: 0,
		};
	}

	create() {
		// Create interior
		this.createInterior(this.buildingColor);

		// Create common UI
		this.createCommonUI();

		// Display money and loan status
		this.createMoneyDisplay();

		// Create bank options
		this.createBankOptions();

		// Create NPC
		this.createNPC();
	}

	createMoneyDisplay() {
		const width = this.cameras.main.width;

		// Money display
		this.moneyText = this.add
			.text(
				width / 2,
				100,
				`💵 Current Balance: $${this.playerMoney}`,
				{
					fontSize: "28px",
					color: "#4ade80",
					backgroundColor: "#000000aa",
					padding: { x: 20, y: 12 },
					fontStyle: "bold",
				},
			)
			.setOrigin(0.5)
			.setDepth(100);

		// Loan status (if active)
		if (this.loanData.active) {
			const totalOwed =
				this.loanData.amount + this.loanData.interest;
			const daysRemaining =
				this.loanData.dueDay - this.timeManager.day;

			this.loanText = this.add
				.text(
					width / 2,
					150,
					`⚠️ Active Loan: $${totalOwed} (Due in ${daysRemaining} days)`,
					{
						fontSize: "18px",
						color:
							daysRemaining <= 2
								? "#ef4444"
								: "#fbbf24",
						backgroundColor: "#000000aa",
						padding: { x: 15, y: 8 },
					},
				)
				.setOrigin(0.5)
				.setDepth(100);
		}
	}

	createBankOptions() {
		const width = this.cameras.main.width;

		// Title
		this.add
			.text(width / 2, 220, "How Can We Help You?", {
				fontSize: "26px",
				color: "#ffff00",
			})
			.setOrigin(0.5);

		// Loan options
		const loans = [
			{
				name: "Small Loan",
				amount: 100,
				interest: 10,
				duration: 7, // days
				y: 300,
			},
			{
				name: "Medium Loan",
				amount: 500,
				interest: 75,
				duration: 10,
				y: 380,
			},
			{
				name: "Large Loan",
				amount: 1000,
				interest: 200,
				duration: 14,
				y: 460,
			},
			{
				name: "Huge Loan",
				amount: 2500,
				interest: 600,
				duration: 21,
				y: 540,
			},
		];

		// Only show loan options if no active loan
		if (!this.loanData.active) {
			loans.forEach((loan) => {
				this.createLoanOption(loan);
			});
		} else {
			// Show repayment option
			this.createRepaymentOption();
		}

		// Deposit/withdraw section (future feature placeholder)
		this.add
			.text(
				width / 2,
				640,
				"💳 Savings Account (Coming Soon)",
				{
					fontSize: "20px",
					color: "#888888",
				},
			)
			.setOrigin(0.5);
	}

	createLoanOption(loan) {
		const width = this.cameras.main.width;
		const totalRepayment = loan.amount + loan.interest;

		// Container
		const container = this.add.container(width / 2, loan.y);

		// Background
		const bg = this.add
			.rectangle(0, 0, 700, 65, 0x000000, 0.7)
			.setInteractive({ useHandCursor: true });

		// Loan name
		const nameText = this.add
			.text(-330, -12, loan.name, {
				fontSize: "22px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0, 0.5);

		// Details
		const detailsText = this.add
			.text(
				-330,
				15,
				`Get $${loan.amount} now | Repay $${totalRepayment} in ${loan.duration} days`,
				{
					fontSize: "14px",
					color: "#aaaaaa",
				},
			)
			.setOrigin(0, 0.5);

		// Interest rate
		const interestPercent = Math.round(
			(loan.interest / loan.amount) * 100,
		);
		const rateText = this.add
			.text(330, 0, `${interestPercent}% interest`, {
				fontSize: "16px",
				color: "#fbbf24",
			})
			.setOrigin(1, 0.5);

		container.add([bg, nameText, detailsText, rateText]);

		// Make interactive
		bg.on("pointerdown", () => this.takeLoan(loan));
		bg.on("pointerover", () => {
			bg.setFillStyle(0x2c3e50);
		});
		bg.on("pointerout", () => {
			bg.setFillStyle(0x000000, 0.7);
		});
	}

	createRepaymentOption() {
		const width = this.cameras.main.width;
		const totalOwed = this.loanData.amount + this.loanData.interest;
		const canRepay = this.playerMoney >= totalOwed;

		// Repay loan button
		this.createButton(
			width / 2,
			340,
			`💰 Repay Loan ($${totalOwed})`,
			() => this.repayLoan(),
			{
				backgroundColor: canRepay
					? "#22c55e"
					: "#6b7280",
				hoverColor: canRepay ? "#16a34a" : "#6b7280",
				fontSize: "24px",
			},
		);

		if (!canRepay) {
			this.add
				.text(
					width / 2,
					400,
					`You need $${totalOwed - this.playerMoney} more to repay this loan.`,
					{
						fontSize: "16px",
						color: "#ef4444",
					},
				)
				.setOrigin(0.5);
		}

		// Warning about overdue loans
		const daysRemaining =
			this.loanData.dueDay - this.timeManager.day;
		if (daysRemaining <= 2) {
			this.add
				.text(
					width / 2,
					460,
					`⚠️ WARNING: Loan is due soon!\nYou'll lose the game if you can't pay!`,
					{
						fontSize: "18px",
						color: "#ef4444",
						align: "center",
						lineSpacing: 5,
					},
				)
				.setOrigin(0.5);
		}
	}

	takeLoan(loan) {
		// Confirm loan
		const totalRepayment = loan.amount + loan.interest;
		const confirmed = confirm(
			`Take out a $${loan.amount} loan?\n\nYou'll need to repay $${totalRepayment} within ${loan.duration} days.\n\nIf you can't repay by then, you'll LOSE THE GAME!`,
		);

		if (!confirmed) return;

		// Give player the money
		this.addMoney(loan.amount);

		// Set loan data
		this.loanData = {
			active: true,
			amount: loan.amount,
			interest: loan.interest,
			dueDay: this.timeManager.day + loan.duration,
		};

		this.showMessage(
			`✓ Loan approved! $${loan.amount} added to your account.`,
			3000,
		);

		// Recreate scene to show loan status
		this.scene.restart({
			...this.init.call(this, {
				playerData: this.playerData,
				statsManager: this.statsManager,
				timeManager: this.timeManager,
				playerMoney: this.playerMoney,
				loanData: this.loanData,
			}),
		});
	}

	repayLoan() {
		const totalOwed = this.loanData.amount + this.loanData.interest;

		if (!this.hasEnoughMoney(totalOwed)) {
			return;
		}

		// Pay off loan
		this.spendMoney(totalOwed);

		// Clear loan data
		this.loanData = {
			active: false,
			amount: 0,
			interest: 0,
			dueDay: 0,
		};

		this.showMessage(
			"✓ Loan fully repaid! Your finances are clear.",
			3000,
		);

		// Recreate scene
		this.scene.restart({
			...this.init.call(this, {
				playerData: this.playerData,
				statsManager: this.statsManager,
				timeManager: this.timeManager,
				playerMoney: this.playerMoney,
				loanData: this.loanData,
			}),
		});
	}

	updateMoneyDisplay() {
		this.moneyText.setText(
			`💵 Current Balance: $${this.playerMoney}`,
		);
	}

	// Override exitBuilding to pass loan data back
	exitBuilding() {
		// Check if loan is overdue
		if (
			this.loanData.active &&
			this.timeManager.day >= this.loanData.dueDay
		) {
			alert(
				"💀 GAME OVER 💀\n\nYou failed to repay your loan on time!\n\nThe bank has seized all your assets.",
			);
			// Return to menu
			this.scene.start("MenuScene");
			return;
		}

		this.scene.start("GameScene", {
			playerColor: this.playerData.color,
			returnData: {
				money: this.playerMoney,
				stats: this.statsManager.toJSON(),
				time: this.timeManager.toJSON(),
				loanData: this.loanData,
			},
		});
	}

	/**
	 * Create NPC (banker)
	 */
	createNPC() {
		const npcDef = getNPCById("banker");
		this.npc = new NPC(npcDef);

		// Position for NPC (left side behind counter)
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

				// Refresh displays in case money/stats changed
				this.updateMoneyDisplay();
			},
		});
	}
}
