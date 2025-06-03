<script lang="ts">
	import { client, logout } from '$lib/oauth';
	import { Avatar, Button, Heading, Input, Modal, Navbar, Popover, ThemeToggle, toast } from '@fuxui/base';
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
		let limit = 100;
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

			for (let like of response?.data.feed) {
				if (!likesIds.has(like.post.uri)) {
					addLikeId(like.post.uri);
					continue;
				}

				found = true;
				cursor = localStorage.getItem('cursor');

				if (cursor) {
					localStorage.removeItem('cursor');
					found = false;
				}

				break;
			}

			if (cursor && response?.data.feed.length > 0) {
				localStorage.setItem('cursor', cursor);
			} else {
				localStorage.removeItem('cursor');
			}
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
				results = res;
			});
	});

	function getLink(uri: string, handle: string) {
		const [did, collection, rkey] = uri.replace('at://', '').split('/');

		return `https://bsky.app/profile/${handle}/post/${rkey}`;
	}

	let infoModalOpen = $state(false);
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
	<ul class=" mt-4 flex flex-col divide-y text-sm">
		{#each results as result (result.doc.uri)}
			<div class="border-base-200 dark:border-base-900 relative border-b py-2">
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
	<div class="text-base-600 dark:text-base-400 mt-4 text-sm font-semibold">No results</div>
{/if}

<div class="fixed right-3 bottom-2">
	<Popover class="flex flex-col items-start gap-2 p-2">
		{#snippet child({ props })}
			<button {...props} class="cursor-pointer hover:opacity-90">
				<Avatar src={client.profile?.avatar} />
			</button>
		{/snippet}
		<ThemeToggle class="backdrop-blur-none absolute top-1 right-1" />
		<Button class="backdrop-blur-none" variant="ghost" onclick={() => (infoModalOpen = true)}
			>Info</Button
		>
		<Button
			class="backdrop-blur-none"
			variant="ghost"
			onclick={() => {
				clearIndex();
				loading = true;
				getLikes();
			}}>Refresh all</Button
		>
		<Button class="backdrop-blur-none" variant="ghost" onclick={logout}>Logout</Button>
	</Popover>
</div>

<Modal bind:open={infoModalOpen}>
	<div class="text-base-700 dark:text-base-300 flex flex-col gap-4 text-sm">
		<div class="flex gap-2">
			Made by
			<div class="flex items-center gap-2">
				<a
					target="_blank"
					href="https://flo-bit.dev"
					class="text-accent-600 dark:text-accent-400 hover:text-accent-500 dark:hover:text-accent-500 font-semibold"
					>flo-bit</a
				>

				<a
					href="https://bsky.app/profile/flo-bit.dev"
					target="_blank"
					class="text-accent-700 hover:text-accent-600 dark:text-accent-400 dark:hover:text-accent-500 transition-colors"
				>
					<span class="sr-only">Bluesky</span>

					<svg
						role="img"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
						class={['size-4']}
						aria-hidden="true"
						fill="currentColor"
						><path
							d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"
						/></svg
					>
				</a>
			</div>
		</div>

		<p>Send me a message if you have any questions, problems or feedback!</p>

		<a
			href="https://github.com/flo-bit/search-bluesky-likes"
			target="_blank"
			class="text-accent-600 hover:text-accent-500 dark:text-base-300 dark:hover:text-accent-400 font-semibold transition-colors"
		>
			Source code
		</a>
	</div>
</Modal>
