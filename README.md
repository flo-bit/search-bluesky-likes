# svelte atproto client oauth demo

this is a scaffold for how to get client side oauth working with sveltekit and atproto 
using the [`@atcute/oauth-browser-client`](https://github.com/mary-ext/atcute) library.

useful when you want people to login to your static sveltekit site.

## how to install

### either clone this repo

1. clone this repo
2. run `npm install`
3. run `npm run dev`
4. go to `http://127.0.0.1:5179`
5. for deployment change the `SITE_URL` variable in `src/lib/oauth/const.ts` 
(e.g. for github pages: `https://your-username.github.io`) and set your base in `svelte.config.js` 
(e.g. for github pages: `base: '/your-repo-name/'`) while keeping it as `''` in development.

```
const config = {
	// ...

	kit: {
		// ...

		paths: {
			base: process.env.NODE_ENV === 'development' ? '' : '/svelte-atproto-client-oauth'
		}
	}
};
```

### or manually install in your own project

1. copy the `src/lib/oauth` folder into your own project
2. also copy the `src/routes/client-metadata.json` folder into your project
3. add the following to your `src/routes/+layout.svelte`

```svelte
<script>
	import { initClient } from '$lib/oauth';

	onMount(() => {
		initClient();
	});
</script>

{@render children()}
```

4. add server and port to your `vite.config.ts`

```js
export default defineConfig({
	server: {
		host: '127.0.0.1',
		port: 5179
	}
});
```

5. install the dependencies

```bash
npm install @atcute/oauth-browser-client @atcute/client
```

6. for deployment change the `SITE_URL` variable in `src/lib/oauth/const.ts` 
(e.g. for github pages: `https://your-username.github.io`) and set your base in `svelte.config.js` 
(e.g. for github pages: `base: '/your-repo-name/'`) while keeping it as `''` in development.

```
const config = {
	// ...

	kit: {
		// ...

		paths: {
			base: process.env.NODE_ENV === 'development' ? '' : '/svelte-atproto-client-oauth'
		}
	}
};
```


## how to use

### login flow

Either use the `LoginModal` component to render a login modal or use the `client` object to handle the login flow yourself.

```ts
// handlin login flow yourself
import { client } from '$lib/oauth';

// methods:
client.login(handle); // login the user
client.isLoggedIn; // check if the user is logged in
client.logout(); // logout the user
```

LoginModal is a component that renders a login modal, add it for a quick login flow. 
(copy the `src/lib/UI` folder into your projects `src/lib` folder)

```svelte
<script>
	import { LoginModal, loginModalState } from '$lib/oauth';
</script>

<LoginModal />

<button onclick={() => loginModalState.show()}>Show Login Modal</button>
```

### make requests

Get the user's profile and make requests with the `client.rpc` object.

```ts
import { client } from '$lib/oauth';

// get the user's profile
const profile = client.profile;

// make requests with the client.rpc object
const response = await client.rpc.request({
	type: 'get',
	nsid: 'app.bsky.feed.getActorLikes',
	params: {
		actor: client.profile?.did,
		limit: 10
	}
});
```
