import { getEmail } from '$lib/AIAPI/webflow.js';
import { getUserPrompts } from '$lib/AIAPI/db';
import { getWeflowSites } from '$lib/AIAPI/webflow';

/** @type {import('./$types').PageServerLoad} */

interface data {
	sites: { id: string; displayName: string }[];
}

interface Prompt {
	prompt_text: string;
	created_at: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load = async ({ params, cookies }) => {
	const webflow_acess_token = cookies.get('auth_token');

	if (webflow_acess_token) {
		const user_data = (await getEmail(webflow_acess_token)) as { email: string };
		const data = (await getWeflowSites(webflow_acess_token)) as data;

		let promptData = (await getUserPrompts(user_data.email)) as Prompt[];
		promptData = promptData.sort((a, b) => b.created_at - a.created_at);
		const prompts = promptData.map((prompt) => prompt.prompt_text);

		if (data) return { sites: data.sites, user: user_data, prompts };
	}

	return { message: 'login' };
};
