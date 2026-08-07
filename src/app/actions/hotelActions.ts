'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addHotel(formData: FormData) {
  const supabase = await createClient()

  // 서버 사이드 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 호텔을 등록할 수 있습니다.')
  }

  const station_id = formData.get('station_id') as string;
  const name_ko = formData.get('name_ko') as string;
  const slug = formData.get('slug') as string;
  const agoda_link = formData.get('agoda_link') as string;
  const lowest_price = 0;
  const post_title = formData.get('post_title') as string;
  let content = formData.get('content') as string;

  // SEO를 위해 제목을 본문 최상단에 H2 태그로 삽입
  if (post_title) {
    content = `<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">${post_title}</h2>\n` + content;
  }

  // content에서 첫 번째 <img> 태그의 src를 추출하여 썸네일로 지정합니다.
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = content.match(imgRegex);
  const thumbnail_url = match && match[1] 
    ? match[1] 
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'; // fallback

  const { error } = await supabase.from('hotels').insert({
    station_id,
    name_ko,
    name_en: name_ko, // 임시 fallback
    slug,
    agoda_link,
    lowest_price,
    content,
    review_score: 9.0, // 기본값
    star_rating: 4.0, // 기본값
    review_count: 0,
    thumbnail_url,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 등록된 호텔 식별자(Slug)입니다. 같은 호텔은 중복 등록할 수 없습니다.");
    }
    throw new Error('데이터베이스 오류가 발생했습니다: ' + error.message)
  }

  // 메인 페이지 및 관리자 페이지 캐시 프리징
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deleteHotel(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 호텔을 삭제할 수 있습니다.')
  }

  const { error } = await supabase.from('hotels').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function updateHotel(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 호텔을 수정할 수 있습니다.')
  }

  const id = formData.get('id') as string;
  const station_id = formData.get('station_id') as string;
  const name_ko = formData.get('name_ko') as string;
  const slug = formData.get('slug') as string;
  const agoda_link = formData.get('agoda_link') as string;
  const content = formData.get('content') as string;

  // content에서 첫 번째 <img> 태그의 src를 추출하여 썸네일로 업데이트
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = content.match(imgRegex);
  const thumbnail_url = match && match[1] 
    ? match[1] 
    : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80';

  const { error } = await supabase.from('hotels').update({
    station_id,
    name_ko,
    name_en: name_ko,
    slug,
    agoda_link,
    content,
    thumbnail_url,
  }).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 등록된 호텔 식별자(Slug)입니다. 같은 호텔은 중복 등록할 수 없습니다.");
    }
    throw new Error(error.message);
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath(`/hotel/${slug}`)
  revalidatePath(`/station/[slug]`, 'page')
}
