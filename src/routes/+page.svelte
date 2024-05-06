<script lang="ts">
	import { Loader, MessageSquare, MessageSquareQuote, Search } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import Typewriter from 'svelte-typewriter';
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import Menu from 'lucide-svelte/icons/menu';
	import Package2 from 'lucide-svelte/icons/package-2';
	import { cn } from '$lib/utils.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	import { suggestions } from '$lib/data/constants';
	import { invalidateAll } from '$app/navigation';
	import * as Table from '$lib/components/ui/table';
	import { myStore, promptStore, userStore } from '$lib/stores/store.js';
	import { onMount, tick } from 'svelte';

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

<div class="flex flex-col">
	<header
		class="flex h-14 items-center justify-between border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6"
	>
		<Sheet.Root>
			<Sheet.Trigger let:builder>
				<Button variant="outline" size="icon" class="shrink-0 md:hidden" builders={[builder]}>
					<Menu class="h-5 w-5"></Menu>
					<span class="sr-only">Toggle navigation menu</span>
				</Button>
			</Sheet.Trigger>
			<Sheet.Content side="left" class="flex flex-col">
				<nav class="grid gap-2 text-lg font-medium">
					<a href="##" class="flex items-center gap-2 text-lg font-semibold">
						<Package2 class="h-6 w-6"></Package2>
						<span class="sr-only">Super User</span>
					</a>
					<h3 class="my-2">Chat History ({prompt_history.length})</h3>
					{#each prompt_history as prompt}
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<!-- svelte-ignore a11y-missing-attribute -->
						<a
							class="flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
						>
							<MessageSquare class="h-4 w-4"></MessageSquare>
							{prompt.slice(0, 27).trim()}...
						</a>
					{/each}
				</nav>
				<div class="mt-auto">
					<Card.Root>
						<Card.Header>
							<Card.Title>Enable Form and CMS AI</Card.Title>
							<Card.Description>
								Contact <a href="https://x.com/autoinvent" target="_blank">@autoinvent</a> to integrate
								your webflow form submissions data &amp; CMS with AI.
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<Button size="sm" class="w-full">Contact</Button>
						</Card.Content>
					</Card.Root>
				</div>
			</Sheet.Content>
		</Sheet.Root>

		<div class="flex w-full items-center justify-between gap-4">
			<div class="flex items-center gap-1">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="lucide lucide-check-check stroke-muted-foreground"
					><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg
				>
				<div class="text-sm text-muted-foreground">
					Imported data from {data.sites ? data.sites.length : 0} projects
				</div>
			</div>

			<DropdownMenu.Root>
				<DropdownMenu.Trigger asChild let:builder>
					<Button builders={[builder]} variant="secondary" size="icon" class="rounded-full">
						<CircleUser class="h-5 w-5" />
						<span class="sr-only">Toggle user menu</span>
					</Button>
				</DropdownMenu.Trigger>
				<DropdownMenu.Content align="end">
					<DropdownMenu.Label>{data.user.firstName} {data.user.lastName}</DropdownMenu.Label>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Settings</DropdownMenu.Item>
					<DropdownMenu.Item>Support</DropdownMenu.Item>
					<DropdownMenu.Separator />
					<DropdownMenu.Item>Logout</DropdownMenu.Item>
				</DropdownMenu.Content>
			</DropdownMenu.Root>
		</div>
	</header>
	<main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
		<div class="flex h-full items-center">
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
								<Button class="mt-4" on:click={() => publish(ai_answer[0][4])}
									>{publishState}</Button
								>
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
		</div>
	</main>
</div>
