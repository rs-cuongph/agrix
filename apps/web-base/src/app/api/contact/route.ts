import { NextResponse } from 'next/server';

const API_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const res = await fetch(`${API_URL}/api/v1/public/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(data, { status: res.status });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
