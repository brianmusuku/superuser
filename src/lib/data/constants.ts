export const SITE_API_DESCRIPTIONS = {
	id: 'Unique identifier for the site',
	workspaceId: 'Unique identifier for the Workspace',
	displayName: 'Name given to the webflow project',
	shortName: 'Slugified site name used in all URLs with webflow io domain',
	previewUrl: 'URL of a generated image for the given site',
	timeZone: 'Site timezone of the site.',
	createdOn: 'Date the site was created. When the site was first initiated from blank state.',
	lastUpdated: 'Date the site was last changed. When site was last worked on.',
	lastPublished: 'Date the site was last published. When work on the site was finished.',
	parentFolderId: 'Unique identifier for the parent folder',
	customDomains: 'The registered Domain name',
	locales: 'Languages used in the site.'
};

export const PAGE_API_DESCRIPTIONS = {
	id: 'Unique identifier for the page',
	siteId: 'Unique identifier for the site',
	collectionId: 'shows if page is collection / CMS page',
	title: 'Name of the page',
	slug: 'Url of the page',
	createdOn: 'Date the page was created',
	lastUpdated: 'Date page was last updated',
	archived: 'Check whether page is archived',
	draft: 'Check whether page is a draft',
	canBranch: 'Check whether the page can be branched',
	'seo.title': 'The seo title of the page',
	'seo.description': 'The seo description of the page',
	'openGraph.title': 'The seo title of the page',
	'openGraph.description': 'The seo description of the page'
};

export const PAGE_MAPPER: { [key: string]: string } = {
	id: 'Id',
	siteId: 'Site Id',
	collectionId: 'CMS or collection',
	title: 'Title',
	slug: 'Page URL',
	createdOn: 'Date created',
	lastUpdated: 'Last update',
	archived: 'Archive',
	draft: 'Draft',
	canBranch: 'Branch',
	'seo.title': 'SEO title',
	'seo.description': 'SEO description',
	'openGraph.title': 'Open graph title',
	'openGraph.description': 'Open graph description'
};

export const API_NAMES_MAPPER: { [key: string]: string } = {
	id: 'id',
	workspaceId: 'Workspace id',
	displayName: 'Display name',
	shortName: 'Staging URL',
	previewUrl: 'Website screenshot',
	timeZone: 'Timezone',
	createdOn: 'Date created',
	lastUpdated: 'Last update',
	lastPublished: 'Last published',
	parentFolderId: 'parent folder',
	customDomains: 'Domain names',
	locales: 'Languages'
};

export const TIME_PERIODS = [
	'',
	'today',
	'this week',
	'this month',
	'this year',
	'january',
	'february',
	'march',
	'april',
	'may',
	'june',
	'july',
	'august',
	'september',
	'october',
	'november',
	'december',
	'monday',
	'tuesday',
	'wednesday',
	'thursday',
	'friday',
	'saturday',
	'sunday'
];

export const suggestions: string[] = [
	'Did anyone ship on a friday?',
	'Has any site been published today?',
	'Have we updated any site in april?',
	'when did I last work on shadcn site',
	'when was shadcn last deployed?',
	'Are the new updates on shadcn online?',
	'List all pages in the shadcn website.',
	'List all pages in the events collection',
	'how many pages are collection pages in shadcn',
	'tell me when brian schedules a meeting'
];
