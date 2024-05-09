import { writable } from 'svelte/store';

const prompt_history: string[] = [];
export const myStore = writable({ prompt_history });

interface webhookData {
	id: string;
	created_at: string;
	urlId: string;
	prompText: string;
	webflowSiteId: string;
	user_email: string;
}
const webhook_data: webhookData[] = [];
export const webhookDataStore = writable({ webhook_data });

export const promptStore = writable({ currentPrompt: '' });

export const userStore = writable({ access_token: '' });
