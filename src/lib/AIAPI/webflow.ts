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
 * return all webflow form given site id
 * @returns
 */
export const getWeflowForms = async (webflow_token: string, site_id: string) => {
	const url = 'https://api.webflow.com/v2/sites/' + site_id + '/forms';
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
 * Get form submissions.
 */
export const getFormSubmissions = async (form_id: string, webflow_token: string) => {
	const endpoint = `https://api.webflow.com/v2/forms/${form_id}/submissions`;
	const options = {
		method: 'GET',
		headers: {
			accept: 'application/json',
			authorization: 'Bearer ' + webflow_token
		}
	};

	const resp = await fetch(endpoint, options);
	const data = await resp.json();
	return data;
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
 * rturns form info from all sites
 * @param webflow_token
 * @returns
 */
export const getFormNameAndIds = async (webflow_token: string) => {
	interface site {
		id: string;
		displayName: string;
	}

	interface form {
		id: string;
		displayName: string;
		lastUpdated: string;
	}

	const { sites } = (await getWeflowSites(webflow_token)) as { sites: site[] };

	const site_details = sites.map(({ id, displayName }) => {
		return { displayName, id };
	});

	const promises = site_details.map((detail) => getWeflowForms(webflow_token, detail.id));
	const formData = (await Promise.all(promises)) as { forms: form[] }[];

	let siteWithForms = formData.map((form, index) => {
		return form.forms.map((f) => {
			return {
				id: f.id,
				site: site_details[index].displayName,
				formName: f.displayName,
				lastUpdated: f.lastUpdated
			};
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	}) as any;

	siteWithForms = siteWithForms.flat();
	const submissionPromises = siteWithForms.map((f: { id: string }) =>
		getFormSubmissions(f.id, webflow_token)
	);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const submissionData = (await Promise.all(submissionPromises)) as any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	siteWithForms.forEach((swf: any, index: number) => {
		swf.numSubmissions = submissionData[index].formSubmissions.length;

		// get submissions as sentences
		const sentences: string[] = [];

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		submissionData[index].formSubmissions.forEach(({ formResponse }: any) => {
			let sentence = '';
			for (const key in formResponse) {
				if (Object.prototype.hasOwnProperty.call(formResponse, key)) {
					const value = formResponse[key];
					sentence += `${key}: ${value}, `;
				}
			}

			sentences.push(sentence.toLowerCase());
		});

		swf.sentences = sentences;
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return siteWithForms.filter((swf: any) => swf.numSubmissions > 0);
};

/**
 * covert form submission data to sentences.
 * @param webflow_token
 * @param form_id
 * @returns
 */
export const getFormSubmisionsAsSentences = async (webflow_token: string, form_id: string) => {
	const sentences: string[] = [];
	const { formSubmissions } = (await getFormSubmissions(form_id, webflow_token)) as {
		formSubmissions: { formResponse: { [key: string]: string } }[];
	};

	formSubmissions.forEach(({ formResponse }) => {
		let sentence = '';
		for (const key in formResponse) {
			if (Object.prototype.hasOwnProperty.call(formResponse, key)) {
				const value = formResponse[key];
				sentence += `${key}: ${value}, `;
			}
		}

		sentences.push(sentence.toLowerCase());
	});

	return sentences;
};
