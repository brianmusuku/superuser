import { DOMAIN } from '$lib/data/constants';
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

const deploywebHook = async (wf_site_id: string, uri: string, webflow_acess_token: string) => {
	// get list of webhooks, find yours, if not create a new one
	const endpoint = `https://api.webflow.com/v2/sites/${wf_site_id}/webhooks`;
	const requestOptions = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			'content-type': 'application/json',
			authorization: 'Bearer ' + webflow_acess_token
		}
	};
	const res = await fetch(endpoint, requestOptions);
	const allwebhooks = (await res.json()) as {
		webhooks: { siteId: string; triggerType: string; url: string }[];
	};
	const foundHook = allwebhooks.webhooks.find(({ siteId, triggerType, url }) => {
		return siteId === wf_site_id && triggerType === 'form_submission' && url.includes(uri);
	});

	if (!foundHook) {
		// create webhook
		const requestOptions_ = {
			method: 'POST',
			headers: {
				accept: 'application/json',
				'content-type': 'application/json',
				authorization: 'Bearer ' + webflow_acess_token
			},
			body: JSON.stringify({
				triggerType: 'form_submission',
				url: DOMAIN + '/api/webhook/' + uri
			})
		};
		const response = await fetch(endpoint, requestOptions_);
		await response.json();
	}
};

export async function POST({ request }: { request: Request }) {
	interface userData {
		site_id: string;
		user_email: string;
		prompt: string;
		webflow_acess_token: string;
	}

	const uri = crypto.randomUUID().replace(/-/g, '');
	const { site_id, prompt, user_email, webflow_acess_token } = (await request.json()) as userData;

	const data = await addWebhook(prompt, site_id, uri, user_email);
	await deploywebHook(site_id, uri, webflow_acess_token);
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
