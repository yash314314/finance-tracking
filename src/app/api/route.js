

export async function GET(request) {
  return new Response(JSON.stringify({ message: 'GET request received' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(request) {
  const body = await request.json();

  return new Response(
    JSON.stringify({ message: 'POST request received', data: body }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}
