import { getEmail, getWeflowSites } from '$lib/AIAPI/ai.js';

/** @type {import('./$types').PageServerLoad} */

interface data {
	sites: { id: string; displayName: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load = async ({ params, cookies }) => {
	const webflow_acess_token = cookies.get('auth_token');

	if (webflow_acess_token) {
		const user_data = await getEmail(webflow_acess_token);
		const data = (await getWeflowSites(webflow_acess_token)) as data;

		if (data) return { sites: data.sites, user: user_data };
	}

	return { message: 'login' };
};
