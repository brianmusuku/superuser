<script lang="ts">
	import { Database, Loader, MessageSquare, Search, StickyNote, UserCog } from 'lucide-svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import CircleUser from 'lucide-svelte/icons/circle-user';
	import Menu from 'lucide-svelte/icons/menu';
	import Package2 from 'lucide-svelte/icons/package-2';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sheet from '$lib/components/ui/sheet/index.js';

	import { suggestions } from '$lib/data/constants';
	import { invalidateAll } from '$app/navigation';
	import { userStore } from '$lib/stores/store.js';
	import { onMount } from 'svelte';
	import SingleAnsCard from '$lib/components/SingleAnsCard.svelte';
	import MultipleAnsCard from '$lib/components/MultipleAnsCard.svelte';
	import { Home } from 'svelte-radix';
	import FormAnsCard from '$lib/components/FormAnsCard.svelte';

	export let data: any;

	let webflow_acess_token: string;

	let currentPrompt = '';
	$: prompt_history = data.prompts || [];

	let ai_answer: any;
	let isLoading = false;

	$: suggestionTextIndex = 0;
	$: suggestionText = suggestions[suggestionTextIndex];
	let currentSiteId = '';

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

	onMount(async () => {
		setInterval(() => {
			suggestionTextIndex += 1;
			if (suggestionTextIndex === suggestions.length) suggestionTextIndex = 0;

			suggestionText = suggestions[suggestionTextIndex];
		}, 1500);
	});

	const detectEnter = async (event: { key: string }) => {
		if (event.key === 'Enter' || event.key === 'Tab') {
			if (event.key === 'Tab') {
				currentPrompt = suggestionText;
			}

			const email = data.user.email;

			isLoading = true;
			prompt_history.push(currentPrompt);

			const res = await fetch('/api/getData', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					webflow_acess_token,
					prompt: currentPrompt,
					email,
					site_id: currentSiteId
				})
			});

			ai_answer = await res.json();

			await invalidateAll();

			isLoading = false;
			suggestionTextIndex = 0;
			suggestionText = suggestions[suggestionTextIndex];
		}
	};

	const reset = () => {
		currentPrompt = '';
		ai_answer = undefined;
	};

	let handleHistoryClick = (prompt: string) => {
		currentPrompt = prompt;
	};
</script>

<div class="hidden border-r bg-muted/40 md:block">
	<div class="flex h-full max-h-screen flex-col gap-2">
		<div class="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
			<a href="/" class="flex items-center gap-2 font-semibold">
				<UserCog class="h-5 w-5"></UserCog>
				<span><span class="text-blue-500">Super</span>User</span>
			</a>
			<!-- <Button variant="outline" size="icon" class="ml-auto h-8 w-8">
				<Save class="h-4 w-4" />
				<span class="sr-only">Toggle notifications</span>
			</Button> -->
		</div>
		<div class="flex-1">
			<nav class="grid items-start px-2 text-sm font-normal lg:px-4">
				<div class="flex flex-col justify-between">
					<div class="max-h-[40rem] overflow-y-scroll">
						<h3 class="my-2">Chat History ({prompt_history.length})</h3>
						{#each prompt_history as { text, topic }}
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-missing-attribute -->
							<a
								class="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg py-2 pr-3 text-xs font-normal text-muted-foreground transition-all hover:bg-muted hover:text-primary"
							>
								<div class="flex items-center gap-1" on:click={() => handleHistoryClick(text)}>
									{#if topic === 'site'}
										<Home class="h-3 w-3" />
									{:else if topic === 'page'}
										<StickyNote class="h-3 w-3" />
									{:else if topic === 'user'}
										<Database class="h-3 w-3" />
									{/if}
									<p class="w-48 overflow-hidden text-ellipsis whitespace-nowrap">
										{text}
									</p>
								</div>
							</a>
						{/each}
					</div>
				</div>
			</nav>
		</div>
		<div class="mt-auto p-4">
			<Card.Root>
				<Card.Header class="p-2 pt-0 md:p-4">
					<Card.Title>Enable Form &amp; CMS AI</Card.Title>
					<Card.Description
						>Contact <a href="https://x.com/autoinvent" target="_blank">@autoinvent</a> to integrate
						your webflow form submissions data &amp; CMS with AI.</Card.Description
					>
				</Card.Header>
				<Card.Content class="p-2 pt-0 md:p-4 md:pt-0">
					<a href="https://x.com/autoinvent" target="_blank"
						><Button size="sm" class="w-full bg-blue-500">Contact</Button></a
					>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
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
						<span class="sr-only"><span class="text-blue-500">Super</span> User</span>
					</a>
					<div class="flex h-full flex-col justify-between">
						<div>
							<h3 class="my-2">Chat History ({prompt_history.length})</h3>
							{#each prompt_history as prompt}
								<!-- svelte-ignore a11y-click-events-have-key-events -->
								<!-- svelte-ignore a11y-no-static-element-interactions -->
								<!-- svelte-ignore a11y-missing-attribute -->
								<a
									class="flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
								>
									<MessageSquare class="h-4 w-4"></MessageSquare>
									{prompt.text}
								</a>
							{/each}
						</div>

						<div>
							<h3 class="my-2">Automationsa (0)</h3>
						</div>
					</div>
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
					class="lucide lucide-check-check stroke-blue-500"
					><path d="M18 6 7 17l-5-5" /><path d="m22 10-7.5 7.5L13 16" /></svg
				>
				<div class="text-sm text-muted-foreground">
					Imported data from {data.sites ? data.sites.length : 0} projects
				</div>
			</div>

			<div class="flex gap-4">
				<DropdownMenu.Root>
					<DropdownMenu.Trigger asChild let:builder>
						<Button
							builders={[builder]}
							variant="secondary"
							size="icon"
							class="rounded-full bg-muted/40"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="22"
								height="22"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								class="lucide lucide-bell-dot"
								><path
									d="M19.4 14.9C20.2 16.4 21 17 21 17H3s3-2 3-9c0-3.3 2.7-6 6-6 .7 0 1.3.1 1.9.3"
								/>
								<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
								<circle cx="18" cy="8" r="3" class="fill-blue-500 stroke-blue-500" /></svg
							>
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
		</div>
	</header>
	<main class="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
		<div class="flex h-full items-center">
			<div class="mb-20 flex h-full w-full flex-col items-center justify-center gap-4">
				<div class="flex w-full flex-col items-center justify-center gap-6 rounded-lg">
					<div class="flex flex-col items-center gap-1 text-center">
						{#if currentPrompt === ''}
							<h3 class="text-2xl font-bold tracking-tight">How can I help you today?</h3>

							<p class="text-sm text-muted-foreground">
								Ask for info about your webflow sites, forms and pages.
							</p>
						{/if}
					</div>

					<div class="relative flex gap-4">
						<Search class="absolute left-2.5 top-4 h-4 w-4 text-muted-foreground" />
						<Input
							type="search"
							bind:value={currentPrompt}
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

				{#if ai_answer && !isLoading && currentPrompt !== ''}
					{#if ai_answer.length === 1}
						<SingleAnsCard {ai_answer} on:reset={reset} />
					{:else if ai_answer.type === 'form'}
						<FormAnsCard {ai_answer} on:reset={reset} />
					{:else if ai_answer.info && ai_answer.info.length > 1}
						<MultipleAnsCard {ai_answer} on:reset={reset} />
					{/if}
				{/if}
			</div>
		</div>
	</main>
</div>

<style>
	/* Hide scrollbars for WebKit-based browsers (Chrome, Safari, Opera) */
	::-webkit-scrollbar {
		display: none;
	}

	/* Hide scrollbars for Internet Explorer and Edge */
	* {
		-ms-overflow-style: none;
	}
</style>
