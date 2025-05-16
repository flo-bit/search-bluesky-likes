import type { PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import type { RxDatabase } from 'rxdb';

// add two state variables to this object
// also sync to database all of that shit
export const db: {
	database: RxDatabase | null;

	likes: {
		all: { id: string; timestamp: string }[];
		ids: Set<string>;
		addLike: (id: string, timestamp: string) => void;
		removeLike: (id: string) => void;
		hasLike: (id: string) => boolean;
	};

	posts: {
		all: PostView[];
		ids: Set<string>;
		addPost: (post: PostView) => void;
		removePost: (id: string) => void;
		hasPost: (id: string) => boolean;
	};

	user: {
		handle: string;
		did: string;
		setUser: (handle: string, did: string) => void;
	};

	subscribeToChanges: () => void;
} = $state({
	database: null,

	likes: {
		all: [],
		ids: new Set(),

		addLike: (id: string, timestamp: string) => {
			db.database?.likes.insert({
				id,
				timestamp
			});
		},
		removeLike: async (id: string) => {
			const foundDocuments = await db.database?.likes
				.find({
					selector: {
						id: {
							$eq: id
						}
					}
				})
				.exec();
			for (const foundDocument of foundDocuments ?? []) {
				foundDocument.remove();
			}
		},
		hasLike: (id: string) => {
			return db.likes.ids.has(id);
		}
	},

	posts: {
		all: [],
		ids: new Set(),
		addPost: (post: PostView) => {
			db.database?.posts.insert({ id: post.uri, post: JSON.parse(JSON.stringify(post)) });
		},
		removePost: async (id: string) => {
			const foundDocuments = await db.database?.posts
				.find({
					selector: {
						id: {
							$eq: id
						}
					}
				})
				.exec();
			for (const foundDocument of foundDocuments ?? []) {
				foundDocument.remove();
			}
		},
		hasPost: (id: string) => {
			return db.posts.ids.has(id);
		}
	},

	user: {
		handle: '',
		did: '',

		setUser: (handle: string, did: string) => {
			db.database?.user.insert({ id: '1', handle, did });
		}
	},

	subscribeToChanges: () => {
		db.database?.likes.find().$.subscribe((likes) => {
			db.likes.all = likes.map((l) => l);
			db.likes.ids = new Set(likes.map((l) => l.id));
		});

		db.database?.posts.find().$.subscribe((posts) => {
			db.posts.all = posts.map((p) => p.post);
			db.posts.ids = new Set(posts.map((p) => p.id));
		});

		db.database?.user.find().$.subscribe((users) => {
			for (const user of users) {
				if (user?.id !== '1') continue;

				db.user.handle = user.handle;
				db.user.did = user.did;
			}
		});
	}
});
