import { SecretManagerServiceClient } from "@google-cloud/secret-manager";

const client = new SecretManagerServiceClient();

/**
 * Retrieve ElevenLabs API key from Google Cloud Secret Manager
 * @returns {Promise<string>} The API key
 */
export async function initializeSecretManager() {
	const projectId = process.env.GCP_PROJECT_ID;
	const secretId = process.env.GCP_SECRET_ID || "elevenlabs-api-key";
	const versionId = "latest";

	if (!projectId) {
		throw new Error(
			"GCP_PROJECT_ID environment variable is not set",
		);
	}

	try {
		const name = client.secretVersionPath(
			projectId,
			secretId,
			versionId,
		);
		const [version] = await client.accessSecretVersion({ name });

		const secretValue = version.payload.data
			.toString("utf8")
			.trim();

		if (!secretValue) {
			throw new Error("Secret value is empty");
		}

		console.log(
			`✓ Retrieved secret '${secretId}' from GCP Secret Manager`,
		);
		return secretValue;
	} catch (error) {
		if (error.code === 5) {
			throw new Error(
				`Secret '${secretId}' not found in GCP Secret Manager. Please create it first.`,
			);
		}
		throw error;
	}
}

/**
 * Create a new secret in Google Cloud Secret Manager
 * (Utility function for setup)
 */
export async function createSecret(projectId, secretId, secretValue) {
	try {
		const parent = client.projectPath(projectId);

		// Create the secret
		const [secret] = await client.createSecret({
			parent,
			secretId,
			secret: { replication: { automatic: {} } },
		});

		// Add the secret version
		const [version] = await client.addSecretVersion({
			parent: secret.name,
			payload: { data: Buffer.from(secretValue, "utf8") },
		});

		console.log(
			`✓ Created secret '${secretId}' in GCP Secret Manager`,
		);
		return version;
	} catch (error) {
		if (error.code === 6) {
			console.log(
				`Secret '${secretId}' already exists. Updating version...`,
			);
			const [version] = await client.addSecretVersion({
				parent: client.secretPath(projectId, secretId),
				payload: {
					data: Buffer.from(secretValue, "utf8"),
				},
			});
			console.log(`✓ Updated secret '${secretId}' version`);
			return version;
		}
		throw error;
	}
}
