import { GROQ_KEY } from '$lib/data/credentials';
import { getReadableDateTime } from '$lib/utils/timeutils';

const ANTHROPIC_API_KEY =
	'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';
const HUGGING_FACE_KEY = `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`;

interface pages {
	pages: { title: string; id: string; collectionId: string }[];
}

interface sites {
	sites: { displayName: string; shortName: string; id: string }[];
}

interface collection {
	collections: { displayName: string; singularName: string; id: string }[];
}

/**
 * Use hugging face to get sentence similarity metrics
 * @param data
 * @returns
 */
export const querySimilarity = async (data: {
	inputs: { source_sentence: string; sentences: string[] };
}): Promise<number[]> => {
	const response = await fetch(
		'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
		{
			headers: { Authorization: 'Bearer ' + HUGGING_FACE_KEY },
			method: 'POST',
			body: JSON.stringify(data)
		}
	);
	const result = await response.json();
	return result as number[];
};

/**
 * return all webflow sites
 * @returns
 */
export const getWeflowSites = async (webflow_token: string) => {
	const url = 'https://api.webflow.com/beta/sites';
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: 'Bearer ' + webflow_token
		}
	};

	const resp = await fetch(url, options);
	const data = await resp.json();
	return data;
};

/**
 * Get data from any sites mentioned in the prompt.
 * @param prompt
 * @returns
 */
export const getSitesInPrompt = async (prompt: string, webflow_token: string) => {
	const { sites } = (await getWeflowSites(webflow_token)) as sites;

	const foundSites = sites.filter((site: { displayName: string; shortName: string }) => {
		return (
			prompt.toLowerCase().includes(site.displayName.toLowerCase()) ||
			prompt.toLowerCase().includes(site.shortName.toLowerCase())
		);
	});

	return foundSites.length > 0 ? foundSites : sites;
};

/**
 * get all webflow page names
 * @returns
 */
export const getWeflowPages = async (site_id: string, webflow_token: string) => {
	const url = `https://api.webflow.com/beta/sites/${site_id}/pages`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: 'Bearer ' + webflow_token
		}
	};

	const resp = await fetch(url, options);
	const data = await resp.json();
	return data;
};

/**
 * Get data from any pages mentioned in the prompt.
 * @param prompt
 * @returns
 */
export const getPagesInPrompt = async (site_id: string, prompt: string, webflow_token: string) => {
	const { pages } = (await getWeflowPages(site_id, webflow_token)) as pages;

	const foundPages = pages.filter((page: { title: string }) => {
		return prompt.toLowerCase().includes(page.title.toLowerCase());
	});

	return foundPages.length > 0 ? foundPages : pages;
};

export const getCollectionInPrompt = async (
	site_id: string,
	prompt: string,
	webflow_token: string
) => {
	const url = `https://api.webflow.com/beta/sites/${site_id}/collections`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: 'Bearer ' + webflow_token
		}
	};

	const resp = await fetch(url, options);
	const { collections }: collection = await resp.json();
	return collections.filter(
		({ displayName, singularName }: { displayName: string; singularName: string }) => {
			return (
				prompt.toLowerCase().includes(displayName.toLowerCase()) ||
				prompt.toLowerCase().includes(singularName.toLowerCase())
			);
		}
	);
};

/**
 * Get user info
 * @returns
 */

export const getEmail = async (webflow_token: string) => {
	const url = 'https://api.webflow.com/v2/token/authorized_by';
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: 'Bearer ' + webflow_token
		}
	};

	const resp = await fetch(url, options);

	return resp.json();
};

/**
 * Create a webhook for forms
 */

export const createWebhook = async (siteId: string, webflow_token: string) => {
	const endpoint = `https://api.webflow.com/v2/sites/${siteId}/webhooks`;
	const resp = await fetch(endpoint, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
			authorization: 'Bearer ' + webflow_token
		},
		body: JSON.stringify({
			triggerType: 'form_submission'
		})
	});
	return resp.json();
};

/**
 * Get natural language response given structured results.
 * @param user_question
 * @param info_results
 * @returns
 */

export const getNaturalLangugageAnswer = async (
	user_question: string,
	info_results: { [key: string]: string }[]
) => {
	const currentDate = new Date();
	const dateString = "Today's date is " + getReadableDateTime(currentDate.toString());
	let info = `${dateString}.\n${info_results.length} pages/sites found.\n`;

	info_results.forEach((resultObj) => {
		for (const key in resultObj) {
			if (key !== 'timeFilterPassed' && key !== 'id') info += key + ' is ' + resultObj[key] + '. ';
		}
		info += ' \n';
	});
	const prompt = `Use the supporting info below to answer the user question below. Be terse an correct. \n\nUser Question:\n${user_question}\n\nSupporting Info:\n${info}`;
	console.log(prompt);

	const requestBody = {
		model: 'claude-3-haiku-20240307', //'claude-3-sonnet-20240229',
		max_tokens: 1024,
		temperature: 0.0,
		messages: [{ role: 'user', content: prompt }]
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			'x-api-key': ANTHROPIC_API_KEY,
			'anthropic-version': '2023-06-01',
			'content-type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	};

	const res = await fetch('https://api.anthropic.com/v1/messages', requestOptions);
	const { content }: { content: { text: string }[] } = await res.json();
	if (content) return content[0].text;
	return '';
};

/**
 * Get natural language response given structured results using groq.
 * @param user_question
 * @param info_results
 * @returns
 */

export const getNaturalLangugageAnswerGroq = async (
	user_question: string,
	info_results: { [key: string]: string }[]
) => {
	const currentDate = new Date();
	const dateString = "Today's date is " + getReadableDateTime(currentDate.toString());
	let info = `${dateString}.\n${info_results.length} pages/sites found.\n`;

	info_results.forEach((resultObj) => {
		for (const key in resultObj) {
			if (key !== 'timeFilterPassed' && key !== 'id') info += key + ' is ' + resultObj[key] + '. ';
		}
		info += ' \n';
	});
	const prompt = `Use the supporting info below to answer the user question below. Be terse and correct. \n\nUser Question:\n${user_question}\n\nSupporting Info:\n${info}`;
	console.log(prompt);

	const requestBody = {
		model: 'llama3-8b-8192',
		messages: [{ role: 'user', content: prompt }]
	};

	const requestOptions = {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${GROQ_KEY}`,
			'content-type': 'application/json'
		},
		body: JSON.stringify(requestBody)
	};

	const res = await fetch('https://api.groq.com/openai/v1/chat/completions', requestOptions);
	const chat_completions: { choices: { message: { content: string } }[] } = await res.json();
	return chat_completions.choices[0].message.content;
};
