<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';
	import { initClient } from '$lib/oauth';
	import { Head, Toaster } from '@fuxui/base';

	let { children } = $props();

	onMount(() => {
		initClient();
	});
</script>

{@render children()}


<Toaster />

<Head title="Search Bluesky Likes" emojiFavicon="🦋" />