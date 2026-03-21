import { NextRequest } from 'next/server';

/**
 * Proxy public chat requests to backend SSE endpoint.
 * This avoids CORS issues and hides backend URL from client.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

  try {
    const response = await fetch(`${backendUrl}/ai/public/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
      return Response.json(error, { status: response.status });
    }

    // Forward SSE stream
    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    return Response.json(
      { message: 'Không thể kết nối đến server.' },
      { status: 503 },
    );
  }
}
