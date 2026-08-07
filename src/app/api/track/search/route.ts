import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { start_slug, end_slug } = await request.json();
    
    if (!start_slug || !end_slug) {
      return NextResponse.json({ error: 'Missing station slugs' }, { status: 400 });
    }

    const supabase = await createClient();

    // 관리자(로그인 유저) 제외
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.json({ success: true, skipped: 'admin' });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('osaka_session_id')?.value;
    
    const response = NextResponse.json({ success: true });
    
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookies.set('osaka_session_id', sessionId, { 
        path: '/', 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: 'lax'
      });
    }

    // 검색 기록 저장
    await supabase.from('search_logs').insert([
      {
        session_id: sessionId,
        start_slug,
        end_slug
      }
    ]);

    return response;
  } catch (error) {
    console.error("Search Tracking API error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
