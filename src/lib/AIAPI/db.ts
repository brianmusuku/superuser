const DB_ENDPOINT = `https://x8ki-letl-twmt.n7.xano.io/api:pQj0cpV4/superuser_prompts`;

export const addPromptToDB = async (prompt_text: string, email: string) => {
	await fetch(DB_ENDPOINT, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			prompt_text,
			email
		})
	});
};

export const getUserPrompts = async (email: string) => {
	const resp = await fetch(DB_ENDPOINT + '/' + email, {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json'
		}
	});

	return await resp.json();
};
