<script lang="ts">
	import { client, login } from '$lib/oauth';
	import { BlueskyLogin } from '$lib/bluesky-login';
	import Search from './Search.svelte';
	import { Heading } from '@fuxui/base';
</script>

<div class="mx-auto my-18 max-w-xl px-4 md:my-28">
	{#if client.isInitializing}
		<Heading>Loading...</Heading>
	{/if}

	{#if !client.isInitializing && !client.agent}
		<Heading class="mb-8">Search your bluesky likes</Heading>
		<BlueskyLogin
			login={async (handle: string) => {
				await login(handle);
				return true;
			}}
		/>

		<div class="text-base-700 mt-36 flex text-sm flex-col gap-4">
			<div class="flex gap-2">
				Made by
				<div class="flex items-center gap-2">
					<a target="_blank" href="https://flo-bit.dev" class="text-accent-600 font-semibold"
						>flo-bit</a
					>

					<a
						href="https://bsky.app/profile/flo-bit.dev"
						target="_blank"
						class="text-accent-700 hover:text-accent-600 dark:text-base-300 dark:hover:text-accent-400 transition-colors"
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

			<a href="https://github.com/flo-bit/search-bluesky-likes" target="_blank"
				class="text-accent-600 font-semibold hover:text-accent-500 dark:text-base-300 dark:hover:text-accent-400 transition-colors"
				>
				Source code
			</a>
		</div>
	{/if}

	{#if client.isLoggedIn}
		<Search />
	{/if}
</div>
