import { GROQ_KEY } from '$lib/data/credentials';
import { getReadableDateTime } from '$lib/utils/timeutils';
import { getWeflowPages, getWeflowSites } from './webflow';

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
	const prompt = `Use the supporting info below to answer the user question below. Be terse and correct. \n\nUser Question:\n${user_question}\n\nSupporting Info:\n${info}`;
	// console.log(prompt);

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
 * Get natural language response given form results.
 * @param user_question
 * @param info_results
 * @returns
 */

export const getNaturalLangugageAnswerForms = async (
	user_question: string,
	form_results: string
) => {
	const currentDate = new Date();
	const dateString = "Today's date is " + getReadableDateTime(currentDate.toString());
	const info = `${dateString}.\n${form_results}`;

	const prompt = `Use the form data to answer the user question below. \n\nUser Question:\n${user_question}\n\nForm Data:\n${info}`;
	// console.log(prompt);

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
	// console.log(prompt);

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
