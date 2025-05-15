<script lang="ts">
	import { client, logout } from '$lib/oauth';
	import { Heading, Input, Navbar, toast } from '@fuxui/base';
	import { blueskyPostToPostData, Post } from '$lib/post';
	import { Document, Charset, IndexedDB } from 'flexsearch';
	import { onMount } from 'svelte';

	let index: Document;
	let likesIds = $state(new Set<string>());

	let loading = $state(true);

	let count = $state(0);

	function addLikeId(id: string) {
		likesIds.add(id);
		// save in local storage
		localStorage.setItem('likes-ids', Array.from(likesIds).join(','));

		count = likesIds.size;
	}

	function getLikesIds() {
		const ids = localStorage.getItem('likes-ids');
		if (ids) {
			likesIds = new Set(ids.split(','));
		}

		count = likesIds.size;
	}

	function clearLikesIds() {
		likesIds.clear();
		localStorage.removeItem('likes-ids');

		count = 0;
	}

	async function clearIndex() {
		if (!index) return;

		clearLikesIds();
		index.clear();

		await index.commit();

		count = 0;
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

		getLikesIds();
		getLikes();
	});

	async function getLikes() {
		if (!client.profile?.did || !client.rpc || !index) return;

		let all = [];

		let cursor = undefined;
		let response = undefined;
		let found = false;
		let limit = 10;
		do {
			try {
				response = await client.rpc.request({
					type: 'get',
					nsid: 'app.bsky.feed.getActorLikes',
					params: {
						actor: client.profile.did,
						limit,
						cursor
					}
				});
			} catch (error) {
				// logout
				await logout();
				toast.error('Failed to get likes, please login again');
				break;
			}
			all.push(...response?.data.feed);

			cursor = response?.data.cursor;
			console.log(response?.data.feed);

			for (let like of response?.data.feed) {
				if (likesIds.has(like.post.uri)) {
					found = true;
					console.log('found like in local db, stopping getting more likes');
					break;
				}

				addLikeId(like.post.uri);
			}

			limit = 100;
		} while (cursor && response?.data.feed.length > 0 && !found);

		for (let like of all) {
			index.add(like.post);
		}

		await index.commit();

		loading = false;
	}

	let input: HTMLInputElement | null = $state(null);

	let search = $state('');
	let results = $state([]);

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
</script>

<svelte:window
	onkeydown={() => {
		input?.focus();
	}}
/>

{#if loading}
	<Heading>Loading your likes... ({count})</Heading>
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
		>results: {search ? results.length : 0}, likes loaded: {likesIds.size}</span
	>
{/if}

{#if results.length > 0 && search}
	<ul class="divide-base-100 mt-4 flex flex-col divide-y text-sm">
		{#each results as result (result.doc.uri)}
			<div class="border-base-200 relative border-b py-2">
				<Post
					href={getLink(result.doc.uri, result.doc.author.handle)}
					liked
					data={blueskyPostToPostData(result.doc)}
					class="pb-2"
				/>
			</div>
		{/each}
	</ul>
{:else if search}
	<div class="mt-4 text-sm font-semibold">No results</div>
{/if}
