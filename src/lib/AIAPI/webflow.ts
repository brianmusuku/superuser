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
export const getWeflowForm = async (webflow_token: string, site_id: string) => {
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
