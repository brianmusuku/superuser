<script lang="ts">
	import { X } from 'lucide-svelte';
	import Typewriter from 'svelte-typewriter';
	import { Button } from '$lib/components/ui/button/index.js';
	import { userStore } from '$lib/stores/store';
	import { createEventDispatcher } from 'svelte';
	import * as Select from '$lib/components/ui/select/index.js';
	import { getReadableDateTime } from '$lib/utils/timeutils';

	export let ai_answer: any;
	export let prompt: string;

	const forms = ai_answer.info;
	let currentFormId = '';
	let searchResult: string = ai_answer.answer;

	const dispatch = createEventDispatcher();
	let searchState = 'Get Answer';
	let webflow_acess_token: string;

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

	const searchFormSubmissions = async () => {
		searchState = 'Searching...';
		const res = await fetch('/api/searchFormSubmissions', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ prompt, formId: currentFormId, webflow_acess_token })
		});

		const data = (await res.json()) as any;

		if (data.answer) {
			searchResult = data.answer;
			searchState = 'Done!';
		} else {
			searchState = 'error';
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
		{#if searchResult}
			<div>
				<div class="text-2xl font-bold">SuperUser</div>
				<Typewriter><p class="text-sm text-muted-foreground">{searchResult}</p></Typewriter>
			</div>
		{:else}
			<div>
				<div class="text-2xl font-bold">Choose Form</div>
				<Typewriter
					><p class="text-xs text-muted-foreground">
						Which submissions should I search?
					</p></Typewriter
				>
			</div>
		{/if}
	</div>
	<div class="p-6 pt-0">
		{#if !searchResult}
			<div class="mt-2 flex flex-col gap-0">
				<Select.Root portal={null}>
					<Select.Trigger class="w-full">
						<Select.Value placeholder="Select a form" />
					</Select.Trigger>
					<Select.Content>
						<Select.Group>
							<Select.Label>Choose Form</Select.Label>
							{#each forms as form}
								<Select.Item
									value={form.id}
									label={form.formName + ' (' + form.numSubmissions + ') - ' + form.site}
									on:click={() => (currentFormId = form.id)}
								>
									{form.formName} ({form.site}) - Submissions:
									{form.numSubmissions} - Updated: {getReadableDateTime(form.lastUpdated)}
								</Select.Item>
							{/each}
						</Select.Group>
					</Select.Content>
					<Select.Input name="favoriteFruit" />
				</Select.Root>
			</div>
			<Button class="mt-4" on:click={() => searchFormSubmissions()}>{searchState}</Button>
		{/if}
	</div>
</div>
