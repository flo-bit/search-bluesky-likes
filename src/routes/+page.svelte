<script lang="ts">
	import { client, login } from '$lib/oauth';
	import { BlueskyLogin } from '@fuxui/social';
	import Search from './Search.svelte';
	import { Heading } from '@fuxui/base';
</script>

<div class="mx-auto my-18 max-w-xl px-4 md:my-28">
	{#if client.isInitializing}
		<Heading>Loading...</Heading>
	{/if}

	{#if !client.isInitializing && !client.agent}
		<Heading class="mb-8">Search your bluesky likes</Heading>

		<BlueskyLogin login={async (handle: string) => {
			localStorage.removeItem('likes-ids');
			await login(handle);
			return true;
		}} />
	{/if}

	{#if client.isLoggedIn}
		<Search />
	{/if}
</div>
