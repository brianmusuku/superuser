import { json } from '@sveltejs/kit';

const deleteWebhook = async (webhookId: string) => {
	const requestBody = {
		superuser_webhooks_id: webhookId
	};

	const requestOptions = {
		method: 'DELETE',
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
	const { id }: { id: string } = await request.json();
	const data = await deleteWebhook(id);
	return json(data);
}
