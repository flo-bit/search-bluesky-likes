// place files you want to import through the `$lib` alias in this folder.

import { db } from './db/database.svelte';
import { listRecords } from './oauth/auth.svelte';

export async function loadLikes(did: string) {
	let cursor = undefined;
	let found = false;

	do {
		const likes = await listRecords({ did, collection: 'app.bsky.feed.like', cursor });
		cursor = likes.data.cursor;

		for (const like of likes.data.records) {
			const uri = (like.value.subject as { uri: string }).uri;
			const timestamp = like.value.createdAt as string;

			if (!db.likes.hasLike(uri)) {
				console.log(uri, timestamp);
				db.likes.addLike(uri, timestamp);
			} else {
				console.log('found like in local db, stopping getting more likes');
				found = true;

				// get cursor from local storage
				cursor = localStorage.getItem('likes-cursor');

				if (cursor) found = false;
				break;
			}
		}

		// save cursor to local storage
		if (cursor) {
			localStorage.setItem('likes-cursor', cursor);
		} else {
			localStorage.removeItem('likes-cursor');
		}
	} while (cursor && !found);

	return true;
}