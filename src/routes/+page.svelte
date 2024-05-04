<script lang="ts">
	import { Loader, MessageSquareQuote, Search } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Typewriter from 'svelte-typewriter';
	import Check from 'lucide-svelte/icons/check';
	import ChevronsUpDown from 'lucide-svelte/icons/chevrons-up-down';
	import * as Command from '$lib/components/ui/command/index.js';
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '$lib/utils.js';

	import { suggestions } from '$lib/data/constants';
	import { invalidateAll } from '$app/navigation';
	import * as Table from '$lib/components/ui/table';
	import { myStore, promptStore, userStore } from '$lib/stores/store.js';
	import { onMount, tick } from 'svelte';
	import Cookies from 'js-cookie';

	export let data: any;

	let webflow_acess_token: string;

	let prompt = '';
	let prompt_history: string[] = [];
	let ai_answer: any;
	let isLoading = false;
	let publishState = 'Publish';

	$: suggestionTextIndex = 0;
	$: suggestionText = suggestions[suggestionTextIndex];

	let open = false;
	let currentSiteId = '';

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

	onMount(() => {
		setInterval(() => {
			suggestionTextIndex += 1;
			if (suggestionTextIndex === suggestions.length) suggestionTextIndex = 0;

			suggestionText = suggestions[suggestionTextIndex];
		}, 1500);
	});

	// We want to refocus the trigger button when the user selects
	// an item from the list so users can continue navigating the
	// rest of the form with the keyboard.
	function closeAndFocusTrigger(triggerId: string) {
		open = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}

	const detectEnter = async (event: { key: string }) => {
		if (event.key === 'Enter' || event.key === 'Tab') {
			if (event.key === 'Tab') {
				prompt = suggestionText;
			}

			isLoading = true;
			prompt_history.push(prompt);
			myStore.set({ prompt_history });

			const res = await fetch('/api/getData', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ webflow_acess_token, prompt, site_id: currentSiteId })
			});

			ai_answer = await res.json();
			await invalidateAll();

			isLoading = false;
			suggestionTextIndex = 0;
			suggestionText = suggestions[suggestionTextIndex];
		}
	};

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

	promptStore.subscribe(async (value: any) => {
		prompt = value.currentPrompt;
		ai_answer = undefined;
		// inputElement.focus();
		//await detectEnter({ key: 'Enter' });
	});
</script>

<div class="mb-20 flex h-full w-full flex-col items-center justify-center gap-4">
	<div class="flex w-full flex-col items-center justify-center gap-6 rounded-lg">
		<div class="flex flex-col items-center gap-1 text-center">
			{#if prompt === ''}
				<h3 class="text-2xl font-bold tracking-tight">How can I help you today?</h3>

				<p class="text-sm text-muted-foreground">
					Ask for info about your webflow sites and pages.
				</p>
			{/if}
		</div>

		<div class="relative flex gap-4">
			<Search class="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
			<Input
				type="search"
				bind:value={prompt}
				on:input={() => (ai_answer = undefined)}
				on:keydown={detectEnter}
				placeholder={suggestionText}
				class="h-12 w-[40rem] appearance-none border bg-background pl-8 shadow-none"
			/>
		</div>
	</div>

	{#if isLoading}
		<Loader class="mt-12 h-8 w-8 text-muted-foreground" />
	{/if}

	{#if ai_answer && !isLoading && prompt !== ''}
		{#if ai_answer.length === 1}
			<div
				class="w-[40rem] rounded-xl border bg-card text-card-foreground"
				data-x-chunk-name="dashboard-01-chunk-1"
				data-x-chunk-description="A card showing the total subscriptions and the percentage difference from last month."
			>
				<div class="flex flex-row items-center justify-between space-y-0 p-6 pb-2">
					<div>
						<!-- <h3 class="text-sm tracking-tight">
						{ai_answer[0][0].split(':')[0]}
					</h3> -->
						<div class="text-2xl font-bold">{ai_answer[0][1]}</div>
						<p class="text-xs text-muted-foreground">{ai_answer[0][2]}</p>
					</div>
					<Button class="mt-4" on:click={() => publish(ai_answer[0][4])}>{publishState}</Button>
				</div>
				<div class="p-6 pt-0">
					<div class="mt-4 flex items-center gap-1">
						<MessageSquareQuote class="h-4 min-w-[4%] text-muted-foreground" />
						<Typewriter class="min-w-[96%]">
							<p class="text-left text-xs text-muted-foreground">{ai_answer[0][3]}</p>
						</Typewriter>
					</div>
				</div>
			</div>
		{:else if ai_answer.info.length > 1}
			<div class="flex w-[40rem] flex-col rounded-md border px-8 pt-2">
				<div class="flex flex-col space-y-1.5 py-6">
					<h3 class="font-semibold leading-none tracking-tight">SuperUser AI</h3>
					<div class="mt-4 flex items-center gap-1">
						<MessageSquareQuote class="h-4 min-w-[4%] text-muted-foreground" />
						<Typewriter class="min-w-[96%]"
							><p class="text-left text-xs text-muted-foreground">
								{ai_answer.response}
							</p></Typewriter
						>
					</div>
					<!-- <p class="text-sm text-muted-foreground">{ai_answer.info.length} sites found.</p> -->
				</div>
				<div class="flex">
					<Table.Root>
						<Table.Caption></Table.Caption>
						<Table.Header>
							<Table.Row>
								{#each Object.keys(ai_answer.info[0]) as keyname, cell_index}
									{#if keyname !== 'timeFilterPassed' && keyname !== 'id'}
										<Table.Head
											class="{Object.keys(ai_answer.info[0]).length - 1 === cell_index
												? 'text-right'
												: 'text-left'} text-sm text-muted-foreground">{keyname}</Table.Head
										>
									{/if}
								{/each}
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each ai_answer.info as row, index}
								<Table.Row class={row.timeFilterPassed ? 'bg-accent' : ''}>
									{#each Object.keys(ai_answer.info[0]) as keyname, cell_index}
										{#if keyname !== 'timeFilterPassed' && keyname !== 'id'}
											<Table.Cell
												class={Object.keys(ai_answer.info[0]).length - 1 === cell_index
													? 'text-right'
													: 'text-left'}>{row[keyname]}</Table.Cell
											>
										{/if}
									{/each}
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			</div>
		{/if}
	{/if}
</div>
