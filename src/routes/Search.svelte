<script lang="ts">
	import { client, logout } from '$lib/oauth';
	import { Heading, Input, Navbar, toast } from '@fuxui/base';
	import { blueskyPostToPostData, Post } from '$lib/post';
	import { Document, Charset, IndexedDB } from 'flexsearch';
	import { onMount } from 'svelte';
	import { loadLikes } from '$lib';
	import { db } from '$lib/db/database.svelte';
	import { getPosts } from '$lib/oauth/auth.svelte';

	let index: Document;
	let loading = $state(true);

	async function loadPosts(uris: string[]) {
		if (!index) return;

		console.log('loading posts', uris.length);
		const posts = await getPosts({ uris });
		for (let post of posts.data.posts) {
			if (!db.posts.hasPost(post.uri)) db.posts.addPost(post);

			index.add(JSON.parse(JSON.stringify(post)));

			await index.commit();
		}
	}

	async function clearIndex() {
		if (!index) return;

		index.clear();

		await index.commit();
	}

	onMount(async () => {
		const db = new IndexedDB('likes-store');

		index = new Document({
			document: {
				id: 'uri',
				store: true,
				index: [
					{
						field: 'author:handle',
						tokenize: 'forward',
						encoder: Charset.LatinBalance
					},
					{
						field: 'author:displayName',
						tokenize: 'forward',
						encoder: Charset.LatinBalance
					},
					{
						field: 'record:text',
						tokenize: 'forward',
						encoder: Charset.LatinBalance
					}
				],
				tag: [
					{
						field: 'likeCount'
					},
					{
						field: 'replyCount'
					},
					{
						field: 'author:handle'
					},
					{
						field: 'author:displayName'
					}
				]
			}
		});

		await index.mount(db);

		clearIndex();
		// getLikesIds();
		getLikes();
	});

	async function getLikes() {
		if (!client.profile?.did || !index) return;

		console.log('loading likes', db.likes.ids.size);

		await loadLikes(client.profile.did);

		console.log('likes loaded', db.likes.ids.size);

		loading = false;
	}

	let input: HTMLInputElement | null = $state(null);

	let search = $state('');
	let results = $state([]);

	let currentLoading = new Set<string>();

	async function loadMissingPosts(likes: {id: string}[]) {
		let joined: string[] = [];
		for (let like of likes) {
			if (currentLoading.has(like.id)) continue;

			currentLoading.add(like.id);
			joined.push(like.id);

			if (joined.length > 24) {
				await loadPosts(joined);
				joined = [];
			}
		}

		if (joined.length > 0) {
			await loadPosts(joined);
		}
	}

	$effect(() => {
		if (loading) return;

		// get likes where we havent loaded the posts
		const likes = db.likes.all.filter(
			(like) => !db.posts.hasPost(like.id) && !currentLoading.has(like.id)
		);

		// if(loading && likes.length < 24) {
		// 	console.log('not enough likes to load', likes.length);
		// 	return;
		// }

		loadMissingPosts(likes);
	});

	$effect(() => {
		if (!search) return;

		index
			.search({
				query: search,
				enrich: true,
				merge: true,
				limit: 20
			})
			.then((res) => {
				console.log(res);
				results = res;
			});
	});

	function getLink(uri: string, handle: string) {
		const [did, collection, rkey] = uri.replace('at://', '').split('/');

		return `https://bsky.app/profile/${handle}/post/${rkey}`;
	}

	const likeCount = $derived(db.likes.ids.size);
	const postCount = $derived(db.posts.ids.size);
</script>

<svelte:window
	onkeydown={() => {
		input?.focus();
	}}
/>

{#if loading}
	<Heading>Loading your likes... ({likeCount})</Heading>
{:else}
	<Navbar class="mx-2 max-w-xl sm:mx-auto md:top-10">
		<Input
			bind:ref={input}
			bind:value={search}
			class="w-full"
			sizeVariant="lg"
			placeholder="Search liked posts"
		/>
	</Navbar>
	<span class="text-base-600 dark:text-base-400 text-xs"
		>results: {search ? results.length : 0}, likes loaded: {db.likes.ids.size}, posts loaded: {postCount}</span
	>
{/if}

{#if results.length > 0 && search}
	<ul class="divide-base-100 mt-4 flex flex-col divide-y text-sm">
		{#each results as result (result.id)}
			{#if result.doc}
				<div class="border-base-200 relative border-b py-2">
					<Post
						href={getLink(result.id, result.doc.author.handle)}
						liked
						data={blueskyPostToPostData(result.doc)}
						class="pb-2"
					/>
				</div>
			{/if}
		{/each}
	</ul>
{:else if search}
	<div class="mt-4 text-sm font-semibold">No results</div>
{/if}
