<script lang="ts">
	import { MessageSquareQuote, X } from 'lucide-svelte';
	import Typewriter from 'svelte-typewriter';
	import { Button } from '$lib/components/ui/button/index.js';
	import { userStore } from '$lib/stores/store';
	import { createEventDispatcher } from 'svelte';

	export let ai_answer: any;

	const dispatch = createEventDispatcher();
	let publishState = 'Publish';
	let webflow_acess_token: string;

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

	const publish = async (siteId: string) => {
		publishState = 'Publishing...';
		const res = await fetch('/api/publish', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ siteId, webflow_acess_token })
		});

		const data = (await res.json()) as any;

		if (data.publishToWebflowSubdomain) publishState = 'Published!';
		else {
			publishState = 'error';
		}
	};

	const removeCard = () => {
		dispatch('reset', true);
	};
</script>

<div
	class="w-[40rem] rounded-xl border bg-card text-card-foreground"
	data-x-chunk-name="dashboard-01-chunk-1"
	data-x-chunk-description="A card showing the total subscriptions and the percentage difference from last month."
>
	<div class="flex w-full justify-between px-4 pt-4 text-sm text-muted-foreground">
		<div></div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="cursor-pointer" on:click={removeCard}>
			<X class="h-4 w-4 " />
		</div>
	</div>
	<div class="flex flex-row items-center justify-between space-y-0 px-6 pb-2">
		<div>
			<!-- <h3 class="text-sm tracking-tight">
									{ai_answer[0][0].split(':')[0]}
								</h3> -->
			<div class="text-2xl font-bold">{ai_answer[0][1]}</div>
			<p class="text-xs text-muted-foreground">{ai_answer[0][2]}</p>
		</div>
	</div>
	<div class="p-6 pt-0">
		<div class="mt-2 flex items-center gap-0">
			<MessageSquareQuote class="h-4 min-w-[4%] text-muted-foreground" />
			<Typewriter class="min-w-[96%]">
				<p class="text-left text-xs text-muted-foreground">{ai_answer[0][3]}</p>
			</Typewriter>
		</div>
		<Button class="mt-4" on:click={() => publish(ai_answer[0][4])}>{publishState}</Button>
	</div>
</div>
