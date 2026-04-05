import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Proxy public chat requests to backend SSE endpoint.
 * This avoids CORS issues and hides backend URL from client.
 *
 * Security: we forward the POS/Admin JWT (stored in httpOnly cookie) to the backend
 * so the backend can verify it server-side. The client cannot forge this cookie
 * because it is httpOnly.
 */
export async function POST(req: NextRequest) {
  const body = await req.json();
  const backendUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

  // Read the POS/Admin JWT from the httpOnly cookie (set by /api/pos/auth)
  const cookieStore = await cookies();
  const posToken = cookieStore.get('agrix_pos_token')?.value;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (posToken) {
    headers['Authorization'] = `Bearer ${posToken}`;
  }

  try {
    const response = await fetch(`${backendUrl}/ai/public/chat`, {
      method: 'POST',
      headers,
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
