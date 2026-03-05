export default {
	input: {
		plugins: {
			global: ["InputPlugin"],
		},
	},
	server: {
		proxy: {
			"/api": {
				target: "http://localhost:3000",
				changeOrigin: true,
			},
		},
	},
};
