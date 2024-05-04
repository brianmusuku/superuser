import { writable } from 'svelte/store';

export const myStore = writable({ prompt_history: [''] });

export const promptStore = writable({ currentPrompt: '' });

export const userStore = writable({ access_token: '' });
