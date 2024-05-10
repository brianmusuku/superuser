import {
	API_NAMES_MAPPER,
	TIME_PERIODS,
	SITE_API_DESCRIPTIONS,
	PAGE_API_DESCRIPTIONS,
	PAGE_MAPPER
} from '$lib/data/constants';
import { evalTimePeriod, getReadableDateTime, sortStringsByFloats } from '$lib/utils/timeutils';
import {
	getCollectionInPrompt,
	getNaturalLangugageAnswer,
	getPagesInPrompt,
	getSitesInPrompt,
	querySimilarity
} from '$lib/AIAPI/ai';

import { json } from '@sveltejs/kit';
import { addPromptToDB } from '$lib/AIAPI/db';

const getPageInfo = async (prompt: string, site_id: string, webflow_acess_token: string) => {
	const pageapi_descriptions = Object.values(PAGE_API_DESCRIPTIONS);
	const pageProperties = Object.keys(PAGE_API_DESCRIPTIONS);

	const sitesInPrompt = await getSitesInPrompt(prompt, webflow_acess_token);
	const siteId = site_id || sitesInPrompt[0].id;

	// filter pages by pageName
	let allpageData = await getPagesInPrompt(siteId, prompt, webflow_acess_token);

	// get chosen properties
	const predictions = await querySimilarity({
		inputs: {
			source_sentence: prompt,
			sentences: pageapi_descriptions
		}
	});

	const sortedTopics: string[] = sortStringsByFloats(pageProperties, predictions);
	const chosenPageProp = sortedTopics[0];

	// find and filter collection names in prompt
	const foundCollections = await getCollectionInPrompt(siteId, prompt, webflow_acess_token);
	if (foundCollections.length > 0) {
		allpageData = allpageData.filter((page) => {
			return page.collectionId === foundCollections[0].id;
		});
	}

	// extract page data by chosen properties
	const pageData = allpageData.map((page: { [x: string]: string }) => {
		let value = page[chosenPageProp];
		let timeFilterPassed = false;

		if (['lastUpdated', 'lastPublished', 'createdOn'].includes(chosenPageProp)) {
			timeFilterPassed = evalTimePeriod(value, chosenPageProp);
			value = getReadableDateTime(value);
		}

		const slug =
			Object.prototype.toString.call(page['slug']) === '[object String]' ? page['slug'] : '';

		return {
			timeFilterPassed,
			'Page name': page['title'],
			'Page Url': '/' + slug,
			[PAGE_MAPPER[chosenPageProp]]: value,
			id: page.id
		};
	});

	const llm_response = await getNaturalLangugageAnswer(
		prompt,
		pageData as { [key: string]: string }[]
	);

	if (pageData.length === 1) {
		return json([
			[
				PAGE_MAPPER[chosenPageProp] + ': ' + pageData[0][PAGE_MAPPER[chosenPageProp]],
				pageData[0]['Page name'],
				pageData[0]['Page Url'],
				llm_response,
				pageData[0].id
			]
		]);
	}

	return json({ info: pageData, response: llm_response });
};

const getSiteInfo = async (prompt: string, webflow_acess_token: string) => {
	const siteapi_descriptions = Object.values(SITE_API_DESCRIPTIONS);
	const topics = Object.keys(SITE_API_DESCRIPTIONS);

	const predictions = await querySimilarity({
		inputs: {
			source_sentence: prompt,
			sentences: siteapi_descriptions
		}
	});

	const sortedTopics: string[] = sortStringsByFloats(topics, predictions);
	const chosenTopic = sortedTopics[0];

	const sitesInPrompt = await getSitesInPrompt(prompt, webflow_acess_token);

	// time filter
	let chosenTimePeriod: string = '';
	if (['lastUpdated', 'lastPublished'].includes(chosenTopic)) {
		const timePeriods = TIME_PERIODS;
		const timePeriodsMapper: { [key: string]: string } = {
			lastUpdated: 'updates',
			lastPublished: 'publishes'
		};

		const appendageString = timePeriodsMapper[chosenTopic];
		const predicted_times = await querySimilarity({
			inputs: {
				source_sentence: prompt.toLowerCase().replace(/\?/g, ''),
				sentences: timePeriods.map((period) => period + ' ' + appendageString)
			}
		});

		const predictedTimePeriodsSorted: string[] = sortStringsByFloats(timePeriods, predicted_times);
		chosenTimePeriod = predictedTimePeriodsSorted[0];
	}

	// extract site data by chosen / predicted property
	const mappedSite = sitesInPrompt.map((site: { [x: string]: string }) => {
		let value = site[chosenTopic];
		let timeFilterPassed = false;

		if (['lastUpdated', 'lastPublished', 'createdOn'].includes(chosenTopic)) {
			timeFilterPassed = evalTimePeriod(value, chosenTimePeriod);
			value = getReadableDateTime(value);
		}

		return {
			timeFilterPassed,
			'Project name': site['displayName'],
			'Project / Site Url': 'https://' + site['shortName'] + '.webflow.io',
			[API_NAMES_MAPPER[chosenTopic]]: value,
			id: site.id
		};
	});

	// sort results by the time filter
	mappedSite.sort((a) => {
		if (a.timeFilterPassed) {
			return -1;
		} else {
			return 1;
		}
	});

	const llm_response = await getNaturalLangugageAnswer(
		prompt,
		mappedSite as { [key: string]: string }[]
	);

	if (mappedSite.length === 1) {
		return json([
			[
				API_NAMES_MAPPER[chosenTopic] + ': ' + mappedSite[0][API_NAMES_MAPPER[chosenTopic]],
				mappedSite[0]['Project name'],
				mappedSite[0]['Project / Site Url'],
				llm_response,
				mappedSite[0].id
			]
		]);
	}

	return json({ info: mappedSite, response: llm_response });
};

const getInstructionInfo = async (prompt: string, webflow_access_token: string) => {
	const data = { prompt, webflow_access_token };
	data.prompt;
	return json({ type: 'webhook' });
};

export async function POST({ request }: { request: Request }) {
	const {
		prompt,
		site_id,
		email,
		webflow_acess_token
	}: { prompt: string; site_id: string; webflow_acess_token: string; email: string } =
		await request.json();

	addPromptToDB(prompt, email);

	const choices = ['question about a site', 'question about a page', 'question about a form'];

	const siteOrPagePredictions = await querySimilarity({
		inputs: {
			source_sentence: prompt.toLowerCase(),
			sentences: choices
		}
	});

	const sortedPredictions: string[] = sortStringsByFloats(choices, siteOrPagePredictions);
	const chosenTopic = sortedPredictions[0];

	if (chosenTopic.includes('page')) return getPageInfo(prompt, site_id, webflow_acess_token);
	if (chosenTopic.includes('site')) return getSiteInfo(prompt, webflow_acess_token);
	if (chosenTopic.includes('instruction')) return getInstructionInfo(prompt, webflow_acess_token);
}
