<script lang="ts">
	import { X } from 'lucide-svelte';
	import Typewriter from 'svelte-typewriter';
	import { userStore } from '$lib/stores/store';
	import { createEventDispatcher } from 'svelte';

	export let ai_answer: any;

	const forms = ai_answer.info;
	let searchResult: string = ai_answer.answer;

	const dispatch = createEventDispatcher();
	let webflow_acess_token: string;

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

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
	<div class="mb-4 flex flex-row items-center justify-between space-y-0 px-6 pb-2">
		{#if searchResult}
			<div>
				<div class="text-xl font-bold">SuperUser</div>
				<Typewriter><p class="text-xs text-muted-foreground">{searchResult}</p></Typewriter>
			</div>
		{/if}
	</div>
</div>
