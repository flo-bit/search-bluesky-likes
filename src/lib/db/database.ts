import { dev } from '$app/environment';

export async function initDBClient() {
	// Dynamically import the module on the client side
	const { createRxDatabase, removeRxDatabase } = await import('rxdb');
	const { getRxStorageDexie } = await import('rxdb/plugins/storage-dexie');
	const { RxDBDevModePlugin } = await import('rxdb/plugins/dev-mode');
	const { addRxPlugin } = await import('rxdb');
	const { wrappedValidateAjvStorage } = await import('rxdb/plugins/validate-ajv');

	if (dev) {
		addRxPlugin(RxDBDevModePlugin);
	}

	const storage = wrappedValidateAjvStorage({
		storage: getRxStorageDexie()
	});

	// use this to clear
	removeRxDatabase('like-database15', storage);

	// Create the database only if it doesn't exist
	const myDatabase = await createRxDatabase({
		name: 'like-database18',
		storage
	});

	const likeSchema = {
		version: 0,
		primaryKey: 'id',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				maxLength: 100
			},
			timestamp: {
				type: 'string'
			}
		},
		required: ['id', 'timestamp']
	};

	const postSchema = {
		version: 0,
		primaryKey: 'id',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				maxLength: 100
			},
			post: {
				type: 'object'
			}
		},
		required: ['id', 'post']
	};

	const userSchema = {
		version: 0,
		primaryKey: 'id',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				maxLength: 100
			},
			did: {
				type: 'string',
				maxLength: 100
			},
			handle: {
				type: 'string'
			}
		},
		required: ['handle', 'id', 'did']
	};

	await myDatabase.addCollections({
		likes: {
			schema: likeSchema
		},
		posts: {
			schema: postSchema
		},
		user: {
			schema: userSchema
		}
	});

	return myDatabase;
}
