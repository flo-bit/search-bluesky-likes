<script lang="ts">
	import RelativeTime from './relative-time';
	import Embed from './embeds/Embed.svelte';
	import { cn, Avatar } from '@fuxui/base';
	import type { WithChildren, WithElementRef } from 'bits-ui';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { PostData } from '.';

	let {
		ref,
		data,
		href,
		class: className,
		bookmarked = $bindable(false),
		liked = $bindable(false),
		children
	}: WithElementRef<WithChildren<HTMLAttributes<HTMLDivElement>>> & {
		data: PostData;
		class?: string;
		href: string;
		intersect?: () => void;
		bookmarked?: boolean;
		liked?: boolean;
	} = $props();

	export function numberToHumanReadable(number: number) {
		if (number < 1000) {
			return number;
		}
		if (number < 1000000) {
			return `${Math.floor(number / 1000)}k`;
		}
		return `${Math.floor(number / 1000000)}m`;
	}
</script>

<div
	bind:this={ref}
	class={cn(
		'text-base-950 dark:text-base-50 group relative transition-colors duration-200',
		className
	)}
>
	{#if data.reposted}
		<div class="mb-3 inline-flex items-center gap-2 pl-4 text-xs font-medium">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-3"
			>
				<path
					fill-rule="evenodd"
					d="M4.755 10.059a7.5 7.5 0 0 1 12.548-3.364l1.903 1.903h-3.183a.75.75 0 1 0 0 1.5h4.992a.75.75 0 0 0 .75-.75V4.356a.75.75 0 0 0-1.5 0v3.18l-1.9-1.9A9 9 0 0 0 3.306 9.67a.75.75 0 1 0 1.45.388Zm15.408 3.352a.75.75 0 0 0-.919.53 7.5 7.5 0 0 1-12.548 3.364l-1.902-1.903h3.183a.75.75 0 0 0 0-1.5H2.984a.75.75 0 0 0-.75.75v4.992a.75.75 0 0 0 1.5 0v-3.18l1.9 1.9a9 9 0 0 0 15.059-4.035.75.75 0 0 0-.53-.918Z"
					clip-rule="evenodd"
				/>
			</svg>

			<div class="inline-flex gap-1">
				reposted by
				<a href={data.reposted.href} class="hover:text-accent-400 font-bold">
					@{data.reposted.handle}
				</a>
			</div>
		</div>
	{/if}

	<a {href} target="_blank" class="absolute inset-0 h-full w-full">
		<span class="sr-only">Open post</span>

		<div
			class="bg-base-400 dark:bg-base-600 absolute -inset-1 -z-10 rounded-2xl opacity-0 transition-colors group-hover:opacity-5"
		></div>
	</a>

	<div class="pointer-events-none z-10 flex gap-4">
		<Avatar src={data.author.avatar} />

		<div class="w-full">
			<div class="mb-1 flex items-start justify-between gap-2">
				<a
					class="group hover:bg-accent-900/5 pointer-events-auto z-10 -mx-2 -my-0.5 flex flex-col items-baseline gap-x-2 gap-y-0.5 rounded-xl px-2 py-0.5 sm:flex-row"
					href={`https://bsky.app/profile/${data.author.handle}`}
					target="_blank"
				>
					<div
						class="text-base-900 group-hover:text-accent-600 dark:text-base-50 dark:group-hover:text-accent-300 text-sm leading-tight font-semibold"
					>
						{data.author.displayName}
					</div>
					<div
						class="text-base-600 group-hover:text-accent-600 dark:text-base-400 dark:group-hover:text-accent-400 text-sm"
					>
						@{data.author.handle}
					</div>
				</a>

				{#if data.createdAt}
					<a
						href={'#'}
						class="text-base-600 hover:text-accent-700 dark:text-base-400 dark:hover:text-accent-300 block text-sm no-underline"
					>
						<RelativeTime date={new Date(data.createdAt)} locale="en" />
					</a>
				{/if}
			</div>

			<div class="prose-base">
				<div
					class="prose dark:prose-invert prose-sm prose-a:no-underline prose-a:text-accent-600 dark:prose-a:text-accent-500"
				>
					{#if data.htmlContent}
						{@html data.htmlContent}
					{:else}
						{@render children?.()}
					{/if}
				</div>
			</div>

			<Embed {data} />

			<div class="text-base-500 dark:text-base-400 mt-4 flex justify-between pr-4">
				<div class="group inline-flex items-center gap-2 text-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="-m-1.5 size-7 rounded-full p-1.5 transition-all duration-100"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
						/>
					</svg>
					{#if data.replyCount}
						{numberToHumanReadable(data.replyCount)}
					{/if}
				</div>

				<div class="group inline-flex items-center gap-2 text-sm">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="-m-1.5 size-7 rounded-full p-1.5 transition-all duration-100"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
						/>
					</svg>
					{#if data.repostCount}
						{numberToHumanReadable(data.repostCount)}
					{/if}
				</div>

				<div class="group inline-flex items-center gap-2 text-sm text-accent-600 dark:text-accent-400">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="-m-1.5 size-7 rounded-full p-1.5 transition-all duration-100"
					>
						<path
							d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z"
						/>
					</svg>

					{#if data.likeCount}
						{numberToHumanReadable(data.likeCount)}
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.prose-base {
		--tw-prose-body: var(--color-base-700);
		--tw-prose-headings: var(--color-base-900);
		--tw-prose-lead: var(--color-base-600);
		--tw-prose-links: var(--color-base-900);
		--tw-prose-bold: var(--color-base-900);
		--tw-prose-counters: var(--color-base-500);
		--tw-prose-bullets: var(--color-base-300);
		--tw-prose-hr: var(--color-base-200);
		--tw-prose-quotes: var(--color-base-900);
		--tw-prose-quote-borders: var(--color-base-200);
		--tw-prose-captions: var(--color-base-500);
		--tw-prose-kbd: var(--color-base-900);
		--tw-prose-kbd-shadows: var(--color-base-900);
		--tw-prose-code: var(--color-base-900);
		--tw-prose-pre-code: var(--color-base-200);
		--tw-prose-pre-bg: var(--color-base-800);
		--tw-prose-th-borders: var(--color-base-300);
		--tw-prose-td-borders: var(--color-base-200);

		--tw-prose-invert-body: var(--color-base-300);
		--tw-prose-invert-headings: var(--color-white);
		--tw-prose-invert-lead: var(--color-base-400);
		--tw-prose-invert-links: var(--color-white);
		--tw-prose-invert-bold: var(--color-white);
		--tw-prose-invert-counters: var(--color-base-400);
		--tw-prose-invert-bullets: var(--color-base-600);
		--tw-prose-invert-hr: var(--color-base-700);
		--tw-prose-invert-quotes: var(--color-base-100);
		--tw-prose-invert-quote-borders: var(--color-base-700);
		--tw-prose-invert-captions: var(--color-base-400);
		--tw-prose-invert-kbd: var(--color-white);
		--tw-prose-invert-kbd-shadows: var(--color-white);
		--tw-prose-invert-code: var(--color-white);
		--tw-prose-invert-pre-code: var(--color-base-300);
		--tw-prose-invert-pre-bg: rgb(0 0 0 / 50%);
		--tw-prose-invert-th-borders: var(--color-base-600);
		--tw-prose-invert-td-borders: var(--color-base-700);
	}
</style>
