import { getEmail, getWeflowSites } from '$lib/AIAPI/ai.js';

/** @type {import('./$types').PageServerLoad} */

interface data {
	sites: { id: string; displayName: string }[];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load = async ({ params, cookies }) => {
	const webflow_acess_token = cookies.get('authToken');

	if (webflow_acess_token) {
		const user_data = await getEmail(webflow_acess_token);
		console.log(user_data);
		const data = (await getWeflowSites(webflow_acess_token)) as data;

		let wfSiteNames = data.sites.map(({ id, displayName }) => {
			return { value: id, label: displayName };
		});
		wfSiteNames = [{ value: '', label: 'All Sites' }, ...wfSiteNames];

		if (data) return { sites: wfSiteNames, user: user_data };
	}

	return { message: 'login' };
};
