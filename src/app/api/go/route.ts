import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetSlug = searchParams.get('target');

  if (!targetSlug) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const supabase = await createClient();

  // 호텔 정보 및 기본 아고다 링크 조회
  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, agoda_link')
    .eq('slug', targetSlug)
    .single();

  if (!hotel) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  const affiliateLink = hotel.agoda_link || 'https://www.agoda.com/?cid=1891538';

  // 관리자(로그인 유저) 제외: 관리자의 클릭은 통계에 미포함
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    // 관리자면 통계 기록 없이 바로 리다이렉트
    return NextResponse.redirect(affiliateLink, { status: 302 });
  }

  const cookieStore = await cookies();
  let sessionId = cookieStore.get('osaka_session_id')?.value;
  
  // 아고다로 302 임시 리다이렉트 처리 (브라우저 캐싱 방지 및 클릭 통계 수집 용이)
  const response = NextResponse.redirect(affiliateLink, { status: 302 });

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    response.cookies.set('osaka_session_id', sessionId, { 
      path: '/', 
      maxAge: 60 * 60 * 24 * 365,
      httpOnly: true,
      sameSite: 'lax'
    });
  }

  // 중복 방지를 제거하고 모든 클릭을 기록합니다.
  // Vercel 서버리스 환경에서 응답 반환 후 프로세스가 종료되어 DB 저장이 누락되는 버그를 막기 위해 반드시 await 처리합니다.
  await supabase.from('user_activities').insert([
    {
      session_id: sessionId,
      action_type: 'CLICK_AGODA',
      target_id: hotel.id
    }
  ]);

  return response;
}
