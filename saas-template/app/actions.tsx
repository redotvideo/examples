'use server';

import pLimit from 'p-limit';

const PER_PAGE = 30;

interface ReturnType {
	stargazerTimes: number[];
	status: 'success' | 'rate-limit' | 'error';
}

async function getStargazerTimesForPage(
	repo: `${string}/${string}`,
	page: number,
	headers: HeadersInit,
): Promise<ReturnType> {
	const response = await fetch(
		`https://api.github.com/repos/${repo}/stargazers?page=${page}&per_page=${PER_PAGE}`,
		{
			headers: {
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Accept: 'application/vnd.github.v3.star+json',
				...headers,
			},
		},
	);

	if (response.status === 403) {
		return {stargazerTimes: [], status: 'rate-limit'};
	}

	if (!response.ok) {
		return {stargazerTimes: [], status: 'error'};
	}

	const data = await response.json();
	const dates: Date[] = data.map((stargazer: any) => new Date(stargazer.starred_at));
	const msTimes = dates.map((date) => date.getTime());

	return {
		stargazerTimes: msTimes,
		status: 'success',
	};
}

const limit = pLimit(10);

async function getTimes(
	repo: `${string}/${string}`,
	totalPages: number,
	headers: HeadersInit,
): Promise<ReturnType> {
	const stargazerPromises: Promise<ReturnType>[] = [];

	// Fetch all pages in parallel
	for (let page = 1; page <= totalPages; page++) {
		stargazerPromises.push(limit(() => getStargazerTimesForPage(repo, page, headers)));
	}

	const stargazerTimes = await Promise.all(stargazerPromises);

	// In case of failure, return the first error
	const objectsThatFailed = stargazerTimes.filter(({status}) => status !== 'success');
	if (stargazerTimes.some(({status}) => status !== 'success')) {
		return {
			stargazerTimes: [],
			status: objectsThatFailed[0].status,
		};
	}

	const stargazerMs = stargazerTimes.map(({stargazerTimes}) => stargazerTimes).flat();
	const sortedMs = stargazerMs.sort((a, b) => a - b);

	const firstMs = sortedMs[0];
	const relativeMs = sortedMs.map((ms) => ms - firstMs);

	return {
		stargazerTimes: relativeMs,
		status: 'success',
	};
}

export async function getGithubRepositoryInfo(
	repoName: `${string}/${string}`,
	key?: string,
): Promise<ReturnType & {repoImage: string}> {
	const headers: HeadersInit = {};

	if (key) {
		headers.Authorization = `token ${key}`;
	}

	const response = await fetch(`https://api.github.com/repos/${repoName}`, {
		headers,
	});

	if (response.status === 403) {
		return {stargazerTimes: [], repoImage: '', status: 'rate-limit'};
	}

	if (!response.ok) {
		return {stargazerTimes: [], repoImage: '', status: 'error'};
	}

	const responseParsed = await response.json();
	const pages = Math.ceil(responseParsed.stargazers_count / PER_PAGE);
	const info = await getTimes(repoName, pages, headers);

	return {
		stargazerTimes: info.stargazerTimes,
		repoImage: responseParsed.owner.avatar_url,
		status: info.status,
	};
}
