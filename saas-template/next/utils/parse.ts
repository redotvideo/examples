export async function parseStream(
	reader: ReadableStreamDefaultReader<Uint8Array>,
	updateProgress: (progress: number) => void,
) {
	while (true) {
		const {done, value} = await reader.read();

		const decoded = new TextDecoder('utf-8').decode(value);
		const split = decoded.split('\n');

		if (done) {
			break;
		}

		const event = split[0].slice(6).trim();
		const data = split[1].slice(6).trim();

		if (event === 'progress') {
			const parsed = JSON.parse(data);
			updateProgress(parsed.progress);
		}

		if (event === 'completed') {
			const parsed = JSON.parse(data);
			return parsed.downloadLink as string;
		}

		if (event === 'error') {
			console.error(data);
			break;
		}
	}

	return '';
}
