import { getNaturalLangugageAnswerForms, querySimilarity } from '$lib/AIAPI/ai';
import { getFormSubmisionsAsSentences } from '$lib/AIAPI/webflow';
import { sortStringsByFloats } from '$lib/utils/timeutils';
import { json } from '@sveltejs/kit';

export async function POST({ request }: { request: Request }) {
	const {
		prompt,
		formId,
		webflow_acess_token
	}: { prompt: string; formId: string; webflow_acess_token: string } = await request.json();

	const choices = await getFormSubmisionsAsSentences(webflow_acess_token, formId);

	const submissionPredictions = await querySimilarity({
		inputs: {
			source_sentence: prompt.toLowerCase(),
			sentences: choices
		}
	});

	const sortedPredictions: string[] = sortStringsByFloats(choices, submissionPredictions);
	const mostSimilarSubmissions = sortedPredictions.slice(0, 2);
	console.log(submissionPredictions);

	const llm_response = await getNaturalLangugageAnswerForms(
		prompt,
		mostSimilarSubmissions.join('\n')
	);

	return json({ answer: llm_response });
}
