<script lang="ts">
	import * as Table from '$lib/components/ui/table';

	import { X } from 'lucide-svelte';
	import Typewriter from 'svelte-typewriter';
	import { userStore } from '$lib/stores/store';
	import { createEventDispatcher } from 'svelte';

	export let ai_answer: any;

	const dispatch = createEventDispatcher();
	let webflow_acess_token: string;

	userStore.subscribe(({ access_token }) => {
		webflow_acess_token = access_token;
	});

	const removeCard = () => {
		dispatch('reset', true);
	};
</script>

<div class="flex w-[40rem] flex-col rounded-md border px-8 pt-2">
	<div class="flex w-full justify-between pt-4 text-sm text-muted-foreground">
		<div></div>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="cursor-pointer" on:click={removeCard}>
			<X class="h-4 w-4 " />
		</div>
	</div>
	<div class="flex flex-col space-y-1.5 pb-6">
		<h3 class="font-semibold leading-none tracking-tight">SuperUser</h3>
		<div class="mt-4 flex items-center gap-1">
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
