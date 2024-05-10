import { writable } from 'svelte/store';

export const userStore = writable({ access_token: '' });
