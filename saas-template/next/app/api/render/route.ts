const RENDER_URL = 'http://localhost:4000/render';

async function getResponse(params: Record<string, string>) {
  return await fetch(RENDER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      params,
    }),
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const params: Record<string, string> = body.params;

  const response = await getResponse(params);
  if (!response.ok) {
    return new Response('Failed to render', {status: 500});
  }

  return new Response(response.body, {status: 200});
}
