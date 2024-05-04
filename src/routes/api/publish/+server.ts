//import { WEBFLOW_TOKEN } from '$lib/data/constants';
import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }) {
	const { siteId, webflow_acess_token }: { siteId: string; webflow_acess_token: string } =
		await request.json();
	const body = JSON.stringify({
		publishToWebflowSubdomain: true
	});

	const url = 'https://api.webflow.com/beta/sites/' + siteId + '/publish';
	const options = {
		method: 'POST',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			authorization: 'Bearer ' + webflow_acess_token
		},
		body
	};

	const resp = await fetch(url, options);
	const data = await resp.json();
	return json(data);
}
