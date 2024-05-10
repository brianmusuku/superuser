<script lang="ts">
	import '../app.pcss';
	import '@fontsource/inter/400.css'; // Import weight 400 (Regular)
	import '@fontsource/inter/500.css'; // Import weight 500 (Medium)
	import '@fontsource/inter/700.css'; // Import weight 700 (Bold)
	import '../app.pcss';

	import { userStore } from '$lib/stores/store';
	import { WEBFLOW_CLIENT_ID } from '$lib/data/credentials';
	import Cookies from 'js-cookie';
	import { onMount } from 'svelte';

	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';

	const loginLink = `https://webflow.com/oauth/authorize?response_type=code&client_id=${WEBFLOW_CLIENT_ID}&scope=assets%3Aread%20assets%3Awrite%20authorized_user%3Aread%20cms%3Aread%20cms%3Awrite%20custom_code%3Aread%20custom_code%3Awrite%20forms%3Aread%20forms%3Awrite%20pages%3Aread%20pages%3Awrite%20sites%3Aread%20sites%3Awrite`;
	let webflow_acess_token: string | undefined = undefined;

	onMount(() => {
		let searchParams = $page.url.searchParams;
		webflow_acess_token = Cookies.get('auth_token') || '';

		if (browser && searchParams.get('auth_token')) {
			webflow_acess_token = searchParams.get('auth_token') || '';

			Cookies.set('auth_token', webflow_acess_token);

			searchParams.delete('auth_token');
			const updatedSearchString = searchParams.toString();
			goto(`?${updatedSearchString}`, { replaceState: true });
		}

		userStore.set({ access_token: webflow_acess_token });
	});
</script>

<div class="font-inter grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
	<slot />
</div>

{#if webflow_acess_token === ''}
	<!-- HTML -->
	<div class="fixed inset-0 z-10 overflow-y-auto" id="modal">
		<div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
		<div class="flex min-h-screen items-center justify-center">
			<div class="transform overflow-hidden rounded-lg text-left shadow-xl transition-all">
				<div class="[&amp;>div]:w-full flex items-center justify-center">
					<div class="h-44 rounded-xl border bg-card text-card-foreground shadow">
						<div class="flex flex-col space-y-1 p-6">
							<h3 class="text-2xl font-semibold tracking-tight">Login with webflow</h3>
							<p class="text-sm text-muted-foreground">
								Make sure you tick the checkbox on all sites you want SU to access.
							</p>
						</div>
						<div class="grid gap-4 p-6 pt-0">
							<div class="flex w-full flex-grow">
								<a href={loginLink} class="w-full"
									><button
										type="button"
										tabindex="0"
										class="inline-flex h-9 w-full items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
										data-button-root=""
										><svg
											data-wf-icon="WebflowIcon"
											width="22"
											height="22"
											viewBox="0 0 16 16"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											><path
												fill-rule="evenodd"
												clip-rule="evenodd"
												d="M15.3333 4L11.2915 12H7.49516L9.18663 8.68446H9.11074C7.71528 10.5186 5.63323 11.726 2.66663 12V8.73034C2.66663 8.73034 4.56444 8.61685 5.6801 7.42922H2.66663V4.00006H6.05345V6.8205L6.12947 6.82018L7.51344 4.00006H10.0748V6.80261L10.1508 6.80249L11.5867 4H15.3333Z"
												fill="currentColor"
											></path></svg
										>
										Login</button
									></a
								>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
