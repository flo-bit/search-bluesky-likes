<script lang="ts">
	import '../app.css';

	import { onMount } from 'svelte';
	import { initClient } from '$lib/oauth';
	import { Head, Toaster } from '@fuxui/base';
	import { db } from '$lib/db/database.svelte';
	import { initDBClient } from '$lib/db/database';

	let { children } = $props();

	onMount(async () => {
		db.database = await initDBClient();
		db.subscribeToChanges();
		
		initClient();
	});
</script>

{@render children()}


<Toaster />

<Head title="Search Bluesky Likes" emojiFavicon="🦋" />