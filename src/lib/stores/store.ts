import { writable } from 'svelte/store';

const prompt_history: string[] = [];
export const myStore = writable({ prompt_history });

export const promptStore = writable({ currentPrompt: '' });

export const userStore = writable({ access_token: '' });
