'use client';

import {Player} from '@revideo/player-react';
import {getGithubRepositoryInfo} from './actions';
import {useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {parseStream} from '../utils/parse';

function Button({
	children,
	loading,
	onClick,
}: {
	children: React.ReactNode;
	loading: boolean;
	onClick: () => void;
}) {
	return (
		<button
			className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
			onClick={() => onClick()}
		>
			{loading && <LoaderCircle className="animate-spin h-4 w-4 text-gray-700" />}
			{children}
		</button>
	);
}

export default function Home() {
	const [repoName, setRepoName] = useState<string>('');
	const [repoImage, setRepoImage] = useState<string | null>();
	const [stargazerTimes, setStargazerTimes] = useState<number[]>([]);

	const [loading, setLoading] = useState(false);
	const [needsKey, setNeedsKey] = useState(false);
	const [key, setKey] = useState('');
	const [error, setError] = useState<string | null>();

	const [progress, setProgress] = useState(0);
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

	/**
	 * Get information about the repository from Github.
	 * @param repoName
	 * @param key
	 * @returns
	 */
	async function fetchInformation(repoName: `${string}/${string}`, key: string) {
		setLoading(true);
		const response = await getGithubRepositoryInfo(repoName, key ?? undefined);
		setLoading(false);

		if (response.status === 'rate-limit') {
			setNeedsKey(true);
			return;
		}

		if (response.status === 'error') {
			setError('Failed to fetch repository information from Github.');
			return;
		}

		setStargazerTimes(response.stargazerTimes);
		setRepoImage(response.repoImage);
	}

	/**
	 * Render the video.
	 */
	async function render() {
		const res = await fetch('/api/render', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				variables: {
					data: stargazerTimes,
					repoName: repoName,
					repoImage: repoImage,
				},
				streamProgress: true,
			}),
		}).catch((e) => console.log(e));

		if (!res) {
			return;
		}

		const downloadUrl = await parseStream(res.body!.getReader(), (p) => setProgress(p));
		setDownloadUrl(downloadUrl);
	}

	return (
		<>
			<div className="m-auto p-12 max-w-7xl flex flex-col gap-y-4">
				<div>
					<div className="text-sm text-gray-700 mb-2">Repository</div>
					<div className="flex gap-x-4 text-sm">
						<input
							className="flex-1 rounded-md p-2 bg-gray-200 focus:outline-none placeholder:text-gray-400"
							placeholder="redotvideo/revideo"
							value={repoName}
							onChange={(e) => setRepoName(e.target.value)}
						/>
						{!needsKey && (
							<Button
								loading={loading}
								onClick={() => fetchInformation(repoName as `${string}/${string}`, key)}
							>
								Fetch information
							</Button>
						)}
					</div>
				</div>
				{needsKey && (
					<div>
						<div className="text-sm text-blue-600 mb-2">
							You hit the Github API rate-limit. Please provide your own key. Requests to Github are
							made directly and the key stays on your device.
						</div>
						<div className="flex gap-x-4 text-sm">
							<input
								className="flex-1 rounded-md p-2 bg-gray-200 focus:outline-none placeholder:text-gray-400"
								placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
								value={key}
								onChange={(e) => setKey(e.target.value)}
							/>
							<Button
								loading={loading}
								onClick={() => fetchInformation(repoName as `${string}/${string}`, key)}
							>
								Fetch information
							</Button>
						</div>
					</div>
				)}
				{error && <div className="text-sm text-red-600">{error}</div>}
				<div>
					<div className="rounded-lg overflow-hidden">
						{/* You can find the scene code inside revideo/src/scenes/example.tsx */}
						<Player
							src="http://localhost:4000/player/"
							controls={true}
							variables={{
								data: stargazerTimes.length > 0 ? stargazerTimes : undefined,
								repoName: repoName ? repoName : undefined,
								repoImage: repoImage ? repoImage : undefined,
							}}
						/>
					</div>
				</div>
				<div className="flex gap-x-4">
					{/* Progress bar */}
					<div className="text-sm flex-1 bg-gray-100 rounded-md overflow-hidden">
						<div
							className="text-gray-600 bg-gray-400 h-full flex items-center px-4 transition-all transition-200"
							style={{
								width: `${Math.round(progress * 100)}%`,
							}}
						>
							{Math.round(progress * 100)}%
						</div>
					</div>
					{downloadUrl ? (
						<a
							href={downloadUrl}
							download
							className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-green-200 text-gray-700 hover:bg-gray-300"
						>
							Download video
						</a>
					) : (
						<Button onClick={() => render()} loading={false}>
							Render video
						</Button>
					)}
				</div>
			</div>
		</>
	);
}
