import Phaser from "phaser";

/**
 * World Map - City layout with buildings, streets, NPCs, and collision
 */
export default class WorldMap {
	constructor(scene) {
		this.scene = scene;
		this.buildings = [];
		this.doors = [];
		this.npcSprites = [];
		this.npcZones = [];
		this.npcBodies = [];

		// World dimensions (much larger than viewport)
		this.worldWidth = 2400;
		this.worldHeight = 1800;

		this.createWorld();
	}

	createWorld() {
		// Create ground
		this.ground = this.scene.add.rectangle(
			this.worldWidth / 2,
			this.worldHeight / 2,
			this.worldWidth,
			this.worldHeight,
			0x4a7c2e,
		);
		this.ground.setDepth(-10);

		// Sidewalk base layer
		this.sidewalk = this.scene.add.rectangle(
			this.worldWidth / 2,
			this.worldHeight / 2,
			this.worldWidth - 200,
			this.worldHeight - 200,
			0x8a8a6a,
		);
		this.sidewalk.setDepth(-9);

		// Create streets (grid layout)
		this.createStreets();

		// Create buildings
		this.createBuildings();

		// Create park area
		this.createPark();

		// Create world NPCs
		this.createWorldNPCs();
	}

	/**
	 * Create street grid
	 */
	createStreets() {
		const graphics = this.scene.add.graphics();

		// Main roads - horizontal
		const hRoads = [450, 900, 1350];
		hRoads.forEach((y) => {
			const road = this.scene.add.rectangle(
				this.worldWidth / 2,
				y,
				this.worldWidth,
				70,
				0x555555,
			);
			road.setDepth(-8);
		});

		// Main roads - vertical
		const vRoads = [600, 1200, 1800];
		vRoads.forEach((x) => {
			const road = this.scene.add.rectangle(
				x,
				this.worldHeight / 2,
				70,
				this.worldHeight,
				0x555555,
			);
			road.setDepth(-8);
		});

		// Yellow center-line markings
		graphics.lineStyle(2, 0xffff00, 0.8);
		graphics.setDepth(-7);

		hRoads.forEach((y) => {
			for (let x = 0; x < this.worldWidth; x += 50) {
				graphics.lineBetween(x, y, x + 25, y);
			}
		});

		vRoads.forEach((x) => {
			for (let y = 0; y < this.worldHeight; y += 50) {
				graphics.lineBetween(x, y, x, y + 25);
			}
		});
	}

	/**
	 * Create city buildings
	 */
	createBuildings() {
		const buildingData = [
			// Top-left block — small
			{
				name: "GYM",
				x: 300,
				y: 250,
				width: 160,
				height: 120,
				color: 0xff6b6b,
				doorSide: "bottom",
			},
			// Top-center block — medium
			{
				name: "BAR",
				x: 900,
				y: 250,
				width: 180,
				height: 130,
				color: 0xf7b731,
				doorSide: "bottom",
			},
			// Top-right block — small
			{
				name: "STORE",
				x: 1500,
				y: 250,
				width: 150,
				height: 110,
				color: 0x4ecdc4,
				doorSide: "bottom",
			},

			// Middle-left block — large
			{
				name: "UNIVERSITY",
				x: 300,
				y: 700,
				width: 280,
				height: 200,
				color: 0x5f27cd,
				doorSide: "bottom",
			},
			// Middle-right block — medium
			{
				name: "APARTMENT",
				x: 1500,
				y: 700,
				width: 200,
				height: 180,
				color: 0x45b7d1,
				doorSide: "bottom",
			},

			// Bottom-left block — medium
			{
				name: "BANK",
				x: 300,
				y: 1150,
				width: 220,
				height: 160,
				color: 0x26de81,
				doorSide: "bottom",
			},
			// Bottom-center block — large
			{
				name: "JOB CENTER",
				x: 900,
				y: 1150,
				width: 260,
				height: 170,
				color: 0x2c3e50,
				doorSide: "bottom",
			},
		];

		buildingData.forEach((data) => {
			this.createBuilding(data);
		});
	}

	/**
	 * Get all door bodies (for collision-based building entry)
	 */
	getDoors() {
		return this.doors;
	}

	/**
	 * Get all NPC interaction zones
	 */
	getNpcZones() {
		return this.npcZones;
	}

	/**
	 * Get all NPC physics bodies (for collision)
	 */
	getNpcBodies() {
		return this.npcBodies;
	}

	/**
	 * Create a single building
	 */
	createBuilding(data) {
		// Building shadow
		const shadow = this.scene.add.rectangle(
			data.x + 4,
			data.y + 4,
			data.width,
			data.height,
			0x000000,
			0.3,
		);
		shadow.setDepth(-1);

		// Building body
		const building = this.scene.add.rectangle(
			data.x,
			data.y,
			data.width,
			data.height,
			data.color,
		);
		building.setStrokeStyle(3, 0x000000);
		building.setDepth(0);

		// Roof accent (darker strip at top)
		const r = ((data.color >> 16) & 0xff) * 0.7;
		const g = ((data.color >> 8) & 0xff) * 0.7;
		const b = (data.color & 0xff) * 0.7;
		const darkColor =
			(Math.floor(r) << 16) |
			(Math.floor(g) << 8) |
			Math.floor(b);
		const roofAccent = this.scene.add.rectangle(
			data.x,
			data.y - data.height / 2 + 10,
			data.width - 4,
			16,
			darkColor,
		);
		roofAccent.setDepth(1);

		// Building name
		const nameText = this.scene.add.text(
			data.x,
			data.y - 5,
			data.name,
			{
				fontSize: 16,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
				backgroundColor: "#00000099",
				padding: { x: 6, y: 3 },
			},
		);
		nameText.setOrigin(0.5);
		nameText.setDepth(2);

		// Door — visual indicator
		const doorY = data.y + data.height / 2 - 2;
		const door = this.scene.add.rectangle(
			data.x,
			doorY,
			28,
			20,
			0x8b4513,
		);
		door.setStrokeStyle(2, 0x5c2d0a);
		door.setDepth(1);

		// Door trigger zone — placed just below the building so the player can walk into it
		const doorZone = this.scene.add.zone(
			data.x,
			data.y + data.height / 2 + 14,
			36,
			28,
		);
		this.scene.physics.add.existing(doorZone, true);
		doorZone.setData("buildingName", data.name);
		this.doors.push(doorZone);

		// Create physics body for building wall collision (single solid body)
		const collisionBody = this.scene.add.zone(
			data.x,
			data.y,
			data.width,
			data.height,
		);
		this.scene.physics.add.existing(collisionBody, true);

		this.buildings.push({
			name: data.name,
			building,
			nameText,
			collisionBody,
			doorZone,
			x: data.x,
			y: data.y,
			width: data.width,
			height: data.height,
		});

		return { doorZone };
	}

	/**
	 * Create park area (center of map)
	 */
	createPark() {
		const parkX = 900;
		const parkY = 700;
		const parkWidth = 250;
		const parkHeight = 200;

		// Park ground
		const park = this.scene.add.rectangle(
			parkX,
			parkY,
			parkWidth,
			parkHeight,
			0x228b22,
		);
		park.setDepth(-3);
		park.setStrokeStyle(2, 0x196619);

		// Park paths
		const pathGraphics = this.scene.add.graphics();
		pathGraphics.fillStyle(0xc2a86b, 0.7);
		pathGraphics.fillRect(
			parkX - 5,
			parkY - parkHeight / 2,
			10,
			parkHeight,
		);
		pathGraphics.fillRect(
			parkX - parkWidth / 2,
			parkY - 5,
			parkWidth,
			10,
		);
		pathGraphics.setDepth(-2);

		// Park name
		const parkText = this.scene.add.text(
			parkX,
			parkY,
			"CITY PARK",
			{
				fontSize: 14,
				fontFamily: "Arial",
				fontStyle: "bold",
				color: "#ffffff",
				backgroundColor: "#1a5c1a99",
				padding: { x: 6, y: 3 },
			},
		);
		parkText.setOrigin(0.5);
		parkText.setDepth(1);

		// Trees
		const treePositions = [
			{ x: parkX - 80, y: parkY - 60 },
			{ x: parkX + 80, y: parkY - 60 },
			{ x: parkX - 80, y: parkY + 60 },
			{ x: parkX + 80, y: parkY + 60 },
			{ x: parkX - 40, y: parkY + 30 },
			{ x: parkX + 40, y: parkY - 30 },
		];

		treePositions.forEach((pos) => {
			const trunk = this.scene.add.rectangle(
				pos.x,
				pos.y + 8,
				6,
				12,
				0x5c3a1a,
			);
			trunk.setDepth(-1);
			const tree = this.scene.add.circle(
				pos.x,
				pos.y,
				14,
				0x0d5c0d,
			);
			tree.setStrokeStyle(1, 0x0a4a0a);
			tree.setDepth(0);
		});

		// Bench
		const bench = this.scene.add.rectangle(
			parkX + 30,
			parkY + 10,
			30,
			10,
			0x8b4513,
		);
		bench.setStrokeStyle(1, 0x5c2d0a);
		bench.setDepth(0);
	}

	/**
	 * Create NPC sprites on the overworld near their buildings
	 */
	createWorldNPCs() {
		const npcData = [
			{
				name: "Marcus",
				color: 0xff6b6b,
				x: 360,
				y: 350,
				building: "GYM",
			},
			{
				name: "Ruby",
				color: 0xf7b731,
				x: 960,
				y: 355,
				building: "BAR",
			},
			{
				name: "Mr. Chen",
				color: 0x4ecdc4,
				x: 1560,
				y: 345,
				building: "STORE",
			},
			{
				name: "Dr. Williams",
				color: 0x5f27cd,
				x: 370,
				y: 850,
				building: "UNIVERSITY",
			},
			{
				name: "Mrs. Thompson",
				color: 0x45b7d1,
				x: 1560,
				y: 840,
				building: "APARTMENT",
			},
			{
				name: "Richard",
				color: 0x26de81,
				x: 370,
				y: 1280,
				building: "BANK",
			},
			{
				name: "Jessica",
				color: 0x2c3e50,
				x: 970,
				y: 1285,
				building: "JOB CENTER",
			},
		];

		npcData.forEach((npc) => {
			// NPC body circle
			const body = this.scene.add.circle(
				npc.x,
				npc.y,
				10,
				npc.color,
			);
			body.setStrokeStyle(2, 0x000000);
			body.setDepth(5);

			// Add physics body so NPCs are solid
			this.scene.physics.add.existing(body, true);
			this.npcBodies.push(body);

			// NPC name label
			const label = this.scene.add.text(
				npc.x,
				npc.y - 18,
				npc.name,
				{
					fontSize: 10,
					fontFamily: "Arial",
					color: "#ffffff",
					backgroundColor: "#00000088",
					padding: { x: 3, y: 1 },
				},
			);
			label.setOrigin(0.5);
			label.setDepth(6);

			// Talk trigger zone around NPC
			const talkZone = this.scene.add.zone(
				npc.x,
				npc.y,
				50,
				50,
			);
			this.scene.physics.add.existing(talkZone, true);
			talkZone.setData("npcName", npc.name);
			talkZone.setData("building", npc.building);
			this.npcZones.push(talkZone);

			this.npcSprites.push({
				body,
				label,
				talkZone,
				building: npc.building,
				name: npc.name,
			});
		});
	}

	/**
	 * Get all collision bodies
	 */
	getCollisionBodies() {
		// Flatten all wall collision bodies
		const bodies = [];
		this.buildings.forEach((b) => {
			if (b.collisionBodies) {
				bodies.push(...b.collisionBodies);
			} else if (b.collisionBody) {
				bodies.push(b.collisionBody);
			}
		});
		return bodies;
	}

	/**
	 * Get building by name
	 */
	getBuilding(name) {
		return this.buildings.find((b) => b.name === name);
	}

	/**
	 * Get world dimensions
	 */
	getWorldSize() {
		return { width: this.worldWidth, height: this.worldHeight };
	}
}
