import { WEBFLOW_CLIENT_ID, WEBFLOW_CLIENT_SECRET } from '$lib/data/credentials';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const load = async ({ params, url }) => {
	const searchParams = url.searchParams;
	const code: string = searchParams.get('code') || '';
	const endpoint = `https://api.webflow.com/oauth/access_token`;

	const requestBody = {
		code,
		client_id: WEBFLOW_CLIENT_ID,
		client_secret: WEBFLOW_CLIENT_SECRET,
		grant_type: 'authorization_code'
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	};

	const res = await fetch(endpoint, requestOptions);
	const { access_token } = (await res.json()) as { access_token: string };

	throw redirect(307, '/?auth_token=' + access_token);

	//return { access_token };
};
