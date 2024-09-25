const RENDER_URL = 'http://localhost:4000/render';

async function getResponse(body: string) {
	return await fetch(RENDER_URL, {
		method: 'POST',
		headers: {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			'Content-Type': 'application/json',
		},
		body,
	});
}

export async function POST(request: Request) {
	const body = await request.json();

	const response = await getResponse(JSON.stringify(body));
	if (!response.ok) {
		return new Response('Failed to render', {status: 500});
	}

	return new Response(response.body, {status: 200});
}
