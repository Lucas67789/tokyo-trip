import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { action_type, target_id } = await request.json();
    
    if (!action_type) {
      return NextResponse.json({ error: 'Missing action_type' }, { status: 400 });
    }

    const supabase = await createClient();

    // 관리자(로그인 유저) 제외: 관리자의 조회/클릭은 통계에서 제외
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      return NextResponse.json({ success: true, skipped: 'admin' });
    }

    const cookieStore = await cookies();
    let sessionId = cookieStore.get('tokyo_session_id')?.value;
    
    const response = NextResponse.json({ success: true });
    
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      response.cookies.set('tokyo_session_id', sessionId, { 
        path: '/', 
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: 'lax'
      });
    }

    // 중복 방지: 동일 세션 + 동일 액션 + 동일 대상이면 최초 1회만 기록
    let query = supabase
      .from('user_activities')
      .select('id')
      .eq('session_id', sessionId)
      .eq('action_type', action_type);
      
    if (target_id) {
      query = query.eq('target_id', target_id);
    } else {
      query = query.is('target_id', null);
    }
    
    const { data: existing } = await query.limit(1);

    if (existing && existing.length > 0) {
      // 이미 기록된 조합이면 스킵
      return response;
    }

    // 최초 방문/클릭만 기록
    await supabase.from('user_activities').insert([
      {
        session_id: sessionId,
        action_type,
        target_id: target_id || null
      }
    ]);

    return response;
  } catch (error) {
    console.error("Tracking API error:", error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
