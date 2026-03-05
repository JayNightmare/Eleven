/**
 * NPC Definitions - All NPCs in the game with personalities and dialogue
 */

export const NPCDefinitions = {
	// === GYM ===
	gymTrainer: {
		id: "gymTrainer",
		name: "Marcus Steel",
		role: "trainer",
		personality: "Energetic, motivating, but sometimes intense",
		voiceId: "21m00Tcm4TlvDq8ikWAM", // Josh - energetic male
		location: "GYM",
		backstory: "Former professional bodybuilder turned personal trainer. Lives and breathes fitness.",
		dialogueTree: {
			firstMeeting:
				"Hey there! Welcome to Steel's Gym! I'm Marcus, and I'm here to help you get HUGE! You look like you could use some muscle. Let's get to work!",
			greetingNeutral: "Ready to train? No pain, no gain!",
			greetingFriendly:
				"My strongest student! Ready to push some limits today?",
			greetingHostile:
				"You again? Don't waste my time if you're not serious.",
			options: [
				{
					id: "advice",
					text: "Any training advice?",
					response: "Listen up! Consistency is KEY. Train every day, eat your protein, and get enough sleep. Your body grows when you rest, not when you lift. And don't skip leg day!",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "Tell me about yourself",
					response: "I won the National Bodybuilding Championship three years in a row. But I had to retire after an injury. Now I train the next generation. It's not about me anymore - it's about YOU reaching YOUR potential!",
					relationshipChange: 10,
					requires: {
						relationship: 20,
					},
				},
				{
					id: "joke",
					text: "Do you even lift?",
					response: "Oh, we got a comedian here! I was squatting your body weight before you were born, kid. But I like the confidence! That attitude will take you far.",
					relationshipChange: 15,
					requires: {
						stats: { strength: 5 },
					},
				},
			],
		},
	},

	// === BAR ===
	bartender: {
		id: "bartender",
		name: "Ruby Martinez",
		role: "bartender",
		personality:
			"Charismatic, witty, great listener, knows everyone's secrets",
		voiceId: "EXAVITQu4vr4xnSDxMaL", // Bella - friendly female
		location: "BAR",
		backstory: "Been tending bar for 15 years. She knows everyone in town and all their stories.",
		dialogueTree: {
			firstMeeting:
				"Well hello there, fresh face! I'm Ruby, and this is my bar. What can I get you? And more importantly, what's your story?",
			greetingNeutral: "Hey there! The usual?",
			greetingFriendly:
				"There's my favorite customer! How's life treating you?",
			greetingHostile:
				"You better not be here to cause trouble.",
			options: [
				{
					id: "advice",
					text: "How do I make friends?",
					response: "Honey, making friends is like mixing drinks - you need the right ingredients. Be genuine, listen more than you talk, and buy people drinks. That last one always helps! But seriously, just be yourself.",
					relationshipChange: 5,
				},
				{
					id: "gossip",
					text: "Any interesting gossip?",
					response: "Oh, where do I start? The banker's been acting weird lately - keeps looking over his shoulder. And Marcus at the gym? He's actually a softie who rescues stray cats. Don't tell him I told you!",
					relationshipChange: 10,
					requires: {
						relationship: 30,
					},
				},
				{
					id: "flirt",
					text: "You look great today",
					response: "Aww, aren't you sweet! I like you, kid. Keep that charm up and you'll do just fine in this town. Here - this round's on the house!",
					relationshipChange: 15,
					effects: {
						money: 10,
					},
					requires: {
						stats: { charm: 7 },
					},
				},
			],
		},
	},

	// === STORE ===
	shopkeeper: {
		id: "shopkeeper",
		name: "Mr. Chen",
		role: "shopkeeper",
		personality:
			"Practical, fair, slightly grumpy but has a good heart",
		voiceId: "pNInz6obpgDQGcFmaJgB", // Adam - calm male
		location: "STORE",
		backstory: "Immigrated 30 years ago and built this store from nothing. It's his pride and joy.",
		dialogueTree: {
			firstMeeting:
				"Welcome to Chen's General Store. We have everything you need and nothing you don't. Cash or card?",
			greetingNeutral: "Back again? What do you need?",
			greetingFriendly:
				"Ah, my best customer! I just got a fresh shipment in.",
			greetingHostile:
				"You break it, you buy it. Remember that.",
			options: [
				{
					id: "advice",
					text: "Any shopping tips?",
					response: "Smart shopping is simple. Buy what you need, not what you want. Energy drinks are good investment - keep you working longer. And protein bars help build muscle. Think about return on investment!",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "How long have you been here?",
					response: "Thirty years I've run this store. Started with nothing but a dream and borrowed money. Now? My children went to university. This store paid for everything. Hard work pays off, young person.",
					relationshipChange: 10,
					requires: {
						relationship: 25,
					},
				},
				{
					id: "discount",
					text: "Could I get a discount?",
					response: "A discount? You think I'm running a charity? *sighs* Fine, fine. You're a regular customer. I'll give you 10% off next purchase. But don't tell anyone!",
					relationshipChange: 20,
					effects: {
						discountUnlocked: true,
					},
					requires: {
						stats: { charm: 10 },
						relationship: 40,
					},
				},
			],
		},
	},

	// === UNIVERSITY ===
	professor: {
		id: "professor",
		name: "Dr. Sarah Williams",
		role: "professor",
		personality:
			"Intelligent, patient, passionate about teaching and learning",
		voiceId: "ThT5KcBeYPX3keUQqHPh", // Dorothy - professional female
		location: "UNIVERSITY",
		backstory: "PhD in multiple fields. Believes education can change lives and is passionate about her students' success.",
		dialogueTree: {
			firstMeeting:
				"Good day! I'm Dr. Williams, head professor here. Education is the key to unlocking your potential. I'm here to guide you on that journey.",
			greetingNeutral: "Hello. Ready for today's lesson?",
			greetingFriendly:
				"Wonderful to see you! Your progress has been remarkable!",
			greetingHostile:
				"If you're not here to learn, don't waste my time.",
			options: [
				{
					id: "advice",
					text: "How can I learn faster?",
					response: "Excellent question! Learning is not about speed but comprehension. Focus on understanding concepts, not memorizing facts. Apply what you learn immediately. And most importantly - stay curious!",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "Why do you teach?",
					response: "Because I believe in the transformative power of knowledge. I've seen students come in unsure and leave confident, ready to change the world. There's nothing more fulfilling than that moment when understanding clicks in someone's eyes.",
					relationshipChange: 10,
					requires: {
						relationship: 30,
					},
				},
				{
					id: "scholarship",
					text: "Are there any scholarships available?",
					response: "Now you're thinking strategically! Yes, for exceptional students, I can offer reduced tuition. You'll need to demonstrate high intelligence and dedication. Keep studying and I'll consider it!",
					relationshipChange: 15,
					effects: {
						scholarshipAvailable: true,
					},
					requires: {
						stats: { intelligence: 8 },
						relationship: 50,
					},
				},
			],
		},
	},

	// === APARTMENT ===
	landlord: {
		id: "landlord",
		name: "Mrs. Thompson",
		role: "landlord",
		personality:
			"Motherly, caring but firm about rent, loves to chat",
		voiceId: "MF3mGyEYCl7XYWbV9V6O", // Elli - warm female
		location: "APARTMENT",
		backstory: "Widowed for 10 years, manages several properties. Treats her tenants like family but expects respect.",
		dialogueTree: {
			firstMeeting:
				"Oh hello dear! I'm Mrs. Thompson, your landlord. Make yourself at home! This apartment may be small but it's cozy. And remember - rent is due on the first!",
			greetingNeutral:
				"Hello dear. Everything alright with the apartment?",
			greetingFriendly:
				"There's my favorite tenant! Come in, come in!",
			greetingHostile:
				"The rent isn't going to pay itself, you know.",
			options: [
				{
					id: "advice",
					text: "Any tips for apartment living?",
					response: "Oh certainly! Keep it clean - a tidy space means a tidy mind. Good furniture makes all the difference for comfort. And get to know your neighbors - community is important!",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "How long have you been a landlord?",
					response: "My late husband and I bought this building 35 years ago. After he passed, I kept it running in his memory. These apartments have housed so many wonderful people over the years. Each tenant is like family to me.",
					relationshipChange: 10,
					requires: {
						relationship: 25,
					},
				},
				{
					id: "gift",
					text: "I brought you some flowers",
					response: "Oh you sweet thing! You didn't have to do that! Such a thoughtful tenant. You know what? I was going to raise your rent next month, but for you? It stays the same. Thank you, dear!",
					relationshipChange: 25,
					effects: {
						rentFrozen: true,
					},
					requires: {
						stats: { charm: 8 },
						items: { flowers: 1 },
					},
				},
			],
		},
	},

	// === BANK ===
	banker: {
		id: "banker",
		name: "Richard Sterling",
		role: "banker",
		personality:
			"Professional, calculating, all about numbers and risk assessment",
		voiceId: "onwK4e9ZLuTAKqWW03F9", // Daniel - professional male
		location: "BANK",
		backstory: "Climbed the corporate ladder through shrewd financial decisions. Respects people who understand money.",
		dialogueTree: {
			firstMeeting:
				"Good day. I'm Richard Sterling, senior loan officer. I handle financial matters with the utmost professionalism. How can I assist you today?",
			greetingNeutral:
				"Welcome to Sterling Bank. What brings you in?",
			greetingFriendly:
				"Ah, one of our valued clients! Your financial responsibility is commendable.",
			greetingHostile:
				"I hope you're not here to ask for another loan you can't repay.",
			options: [
				{
					id: "advice",
					text: "Financial advice?",
					response: "Sound financial planning is essential. Save 20% of your income, invest in yourself through education, and only borrow what you can repay. Good credit is priceless. Treat money with respect.",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "How did you become a banker?",
					response: "I started as a teller, studied finance at night, and worked my way up. Success requires discipline, patience, and understanding that money is a tool, not a goal. Those who master this principle achieve true wealth.",
					relationshipChange: 10,
					requires: {
						relationship: 30,
					},
				},
				{
					id: "investment",
					text: "I want to invest my money",
					response: "Now THIS is what I like to hear! A client who thinks beyond today. For someone with your financial acumen, I can offer premium investment opportunities. Let me set that up for you.",
					relationshipChange: 20,
					effects: {
						investmentAccountUnlocked: true,
					},
					requires: {
						stats: { intelligence: 10 },
						relationship: 50,
						money: 1000,
					},
				},
			],
		},
	},

	// === JOB CENTER ===
	recruiter: {
		id: "recruiter",
		name: "Jessica Park",
		role: "recruiter",
		personality:
			"Enthusiastic, encouraging, wants to see people succeed in their careers",
		voiceId: "jsCqWAovK2LkecY7zXl4", // Rachel - friendly female
		location: "JOB CENTER",
		backstory: "Former corporate headhunter who wanted to help regular people find good jobs instead of just executives.",
		dialogueTree: {
			firstMeeting:
				"Hi there! Welcome to the job center! I'm Jessica, your career counselor. Finding the right job isn't just about money - it's about growth, fulfillment, and building your future. Let's find your perfect fit!",
			greetingNeutral: "Hi! Looking for work today?",
			greetingFriendly:
				"Hey! I've been watching your career progress - you're doing amazing!",
			greetingHostile:
				"Job hopping too much isn't good for your resume, you know.",
			options: [
				{
					id: "advice",
					text: "Career advice?",
					response: "Absolutely! Focus on building skills, not just earning money. Each job should teach you something new. Network with coworkers - they might help you later. And never stop learning. The best employees become the best employers!",
					relationshipChange: 5,
				},
				{
					id: "story",
					text: "Why did you become a recruiter?",
					response: "I used to work for a big firm placing executives. Then I realized - the real impact is helping everyday people find careers that change their lives. That college student who becomes a scientist? The barista who builds a business empire? That's what drives me!",
					relationshipChange: 10,
					requires: {
						relationship: 30,
					},
				},
				{
					id: "reference",
					text: "Can you be a reference?",
					response: "For you? Absolutely! You've shown dedication, growth, and professionalism. I'd be honored to recommend you. In fact, I have connections at some top companies. When you're ready for executive positions, come talk to me!",
					relationshipChange: 20,
					effects: {
						referenceUnlocked: true,
						executiveJobsUnlocked: true,
					},
					requires: {
						stats: {
							intelligence: 8,
							charm: 8,
						},
						relationship: 60,
					},
				},
			],
		},
	},
};

/**
 * Get NPC by ID
 */
export function getNPCById(id) {
	return NPCDefinitions[id] || null;
}

/**
 * Get all NPCs in a location
 */
export function getNPCsByLocation(location) {
	return Object.values(NPCDefinitions).filter(
		(npc) => npc.location === location,
	);
}

/**
 * Get all NPC IDs
 */
export function getAllNPCIds() {
	return Object.keys(NPCDefinitions);
}
