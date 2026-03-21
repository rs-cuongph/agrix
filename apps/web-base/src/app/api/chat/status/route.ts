import { NextRequest } from 'next/server';

/**
 * Proxy public chatbot status request to backend.
 * Returns { enabled: boolean } without requiring auth.
 */
export async function GET(req: NextRequest) {
  const backendUrl = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';

  try {
    const response = await fetch(`${backendUrl}/ai/config/status`, {
      next: { revalidate: 30 }, // cache for 30 seconds
    });

    if (!response.ok) {
      return Response.json({ enabled: false }, { status: 200 });
    }

    const data = await response.json();
    return Response.json(data);
  } catch {
    // If backend is unreachable, default to hiding chatbot
    return Response.json({ enabled: false }, { status: 200 });
  }
}
