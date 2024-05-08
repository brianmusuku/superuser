<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';

	import { createEventDispatcher } from 'svelte';
	export let prompt: string;
	export let sites: Array<any>;

	const dispatch = createEventDispatcher();

	const sitenames = sites.map((site) => {
		return {
			value: site.id,
			label: site.displayName
		};
	});

	const removeCard = () => {
		dispatch('removeCard', true);
	};

	const addReminder = () => {};
</script>

<div class="flex gap-4">
	<Card.Root class="w-[23rem]">
		<Card.Header>
			<Card.Title>Create Reminder</Card.Title>
			<Card.Description>{prompt}.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form>
				<div class="grid w-full items-center gap-4">
					<div class="flex flex-col space-y-1.5">
						<Label for="framework">Website to monitor</Label>
						<Select.Root>
							<Select.Trigger id="framework">
								<Select.Value placeholder="Select" />
							</Select.Trigger>
							<Select.Content>
								{#each sitenames as sitename}
									<Select.Item value={sitename.value} label={sitename.label}
										>{sitename.label}</Select.Item
									>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>
			</form>
		</Card.Content>
		<Card.Footer class="flex justify-between">
			<Button variant="outline" on:click={removeCard}>Cancel</Button>
			<Button on:click={addReminder}>Deploy</Button>
		</Card.Footer>
	</Card.Root>

	<Card.Root class="w-[16rem]">
		<Card.Header>
			<Card.Title>Similar Reminders</Card.Title>
			<Card.Description>0 reminders found.</Card.Description>
		</Card.Header>
		<Card.Content></Card.Content>
		<Card.Footer class="flex justify-between"></Card.Footer>
	</Card.Root>
</div>
