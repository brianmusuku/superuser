import { json } from '@sveltejs/kit';

const addWebhook = async (
	prompt: string,
	wf_site_id: string,
	su_site_id: string,
	user_email: string
) => {
	const requestBody = {
		urlId: su_site_id,
		prompText: prompt,
		webflowSiteId: wf_site_id,
		user_email
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	};

	const res = await fetch(
		'https://x8ki-letl-twmt.n7.xano.io/api:pQj0cpV4/superuser_webhooks',
		requestOptions
	);

	return await res.json();
};

export async function POST({ request }: { request: Request }) {
	interface userData {
		site_id: string;
		user_email: string;
		prompt: string;
	}

	const { site_id, prompt, user_email } = (await request.json()) as userData;
	const data = await addWebhook(prompt, site_id, crypto.randomUUID(), user_email);
	return json(data);
}

export async function GET({ url }) {
	const email = url.searchParams.get('email');

	const requestOptions = {
		method: 'GET',
		headers: {
			'content-type': 'application/json'
		}
	};
	const res = await fetch(
		'https://x8ki-letl-twmt.n7.xano.io/api:pQj0cpV4/superuser_webhook/' + email,
		requestOptions
	);

	const data = await res.json();
	return json(data);
}
