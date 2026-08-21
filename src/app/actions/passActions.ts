'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPass(formData: FormData) {
  const supabase = await createClient()

  // 서버 사이드 인증 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {
    throw new Error('Unauthorized: 오직 관리자만 패스를 등록할 수 있습니다.')
  }

  const name_ko = formData.get('name_ko') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const affiliate_links_raw = formData.get('affiliate_links') as string;
  let affiliate_links: {platform: string, url: string}[] = [];
  try {
    const parsed = JSON.parse(affiliate_links_raw || '[]');
    // Filter out items with empty platform or url
    affiliate_links = parsed.filter((l: any) => l.platform?.trim() && l.url?.trim());
  } catch (e) {
    console.error('Failed to parse affiliate_links', e);
  }
  
  // Backward compatibility: use the first link as the main affiliate_url
  const affiliate_url = affiliate_links.length > 0 ? affiliate_links[0].url : '';
  const target_type = formData.get('target_type') as string; // 'ALL', 'LINE', 'STATION'
  let target_ids = formData.getAll('target_ids') as string[]; // For STATION, this might be multiple. For LINE, single line_id.
  
  // If target_ids is passed as a single comma-separated string, split it
  if (target_ids.length === 1 && target_ids[0].includes(',')) {
    target_ids = target_ids[0].split(',').map(id => id.trim());
  }

  const post_title = formData.get('post_title') as string;
  let content = formData.get('content') as string;

  // SEO를 위해 제목을 본문 최상단에 H2 태그로 삽입
  if (post_title) {
    content = `<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">${post_title}</h2>\n` + content;
  }

  // content에서 첫 번째 <img> 태그의 src를 추출하여 썸네일로 지정합니다.
  const imgRegex = /<img[^>]+src="([^">]+)"/;
  const match = content.match(imgRegex);
  const thumbnail_url = match && match[1] 
    ? match[1] 
    : 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80'; // fallback (train ticket image)

  // 1. 패스 기본 정보 인서트
  const { data: pass, error: passError } = await supabase.from('passes').insert({
    name_ko,
    slug,
    description,
    affiliate_url,
    affiliate_links,
    content,
    thumbnail_url,
    meta_title: `${name_ko} 구매 및 혜택 완벽 정리`,
    meta_description: description
  }).select().single()

  if (passError) {
    if (passError.code === '23505') {
      throw new Error("이미 동일한 식별자(Slug)로 등록된 패스가 존재합니다. 식별자를 변경해주세요.");
    }
    throw new Error(passError.message);
  }

  // 2. 패스 적용 대상 인서트
  const targetInserts = [];
  if (target_type === 'ALL') {
    targetInserts.push({
      pass_id: pass.id,
      target_type: 'ALL',
      target_id: null
    });
  } else if (target_type === 'LINE') {
    // line_id is in target_ids[0]
    targetInserts.push({
      pass_id: pass.id,
      target_type: 'LINE',
      target_id: target_ids[0] || null
    });
  } else if (target_type === 'STATION') {
    // Multiple station_ids
    for (const station_id of target_ids) {
      if (station_id) {
        targetInserts.push({
          pass_id: pass.id,
          target_type: 'STATION',
          target_id: station_id
        });
      }
    }
  }

  if (targetInserts.length > 0) {
    const { error: targetError } = await supabase.from('pass_targets').insert(targetInserts);
    if (targetError) {
      throw new Error(targetError.message);
    }
  }

  // 캐시 프리징
  revalidatePath('/');
  revalidatePath('/admin');
}

export async function deletePass(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {
    throw new Error('Unauthorized: 오직 관리자만 패스를 삭제할 수 있습니다.')
  }

  // pass_targets는 ON DELETE CASCADE로 자동 삭제됨
  const { error } = await supabase.from('passes').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin')
}

export async function updatePass(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user || (process.env.ADMIN_EMAIL && user.email !== process.env.ADMIN_EMAIL)) {
    throw new Error('Unauthorized: 오직 관리자만 패스를 수정할 수 있습니다.')
  }

  const id = formData.get('id') as string;
  const name_ko = formData.get('name_ko') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const affiliate_links_raw = formData.get('affiliate_links') as string;
  let affiliate_links: {platform: string, url: string}[] = [];
  try {
    const parsed = JSON.parse(affiliate_links_raw || '[]');
    affiliate_links = parsed.filter((l: any) => l.platform?.trim() && l.url?.trim());
  } catch (e) {
    console.error('Failed to parse affiliate_links', e);
  }
  
  const affiliate_url = affiliate_links.length > 0 ? affiliate_links[0].url : '';
  const target_type = formData.get('target_type') as string;
  let target_ids = formData.getAll('target_ids') as string[];
  
  if (target_ids.length === 1 && target_ids[0].includes(',')) {
    target_ids = target_ids[0].split(',').map(id => id.trim());
  }

  const content = formData.get('content') as string;

  const { error: passError } = await supabase.from('passes').update({
    name_ko,
    slug,
    description,
    affiliate_url,
    affiliate_links,
    content,
  }).eq('id', id);

  if (passError) {
    if (passError.code === '23505') {
      throw new Error("이미 동일한 식별자(Slug)로 등록된 패스가 존재합니다. 식별자를 변경해주세요.");
    }
    throw new Error(passError.message);
  }

  // Update targets: delete existing and insert new
  await supabase.from('pass_targets').delete().eq('pass_id', id);

  const targetInserts = [];
  if (target_type === 'ALL') {
    targetInserts.push({ pass_id: id, target_type: 'ALL', target_id: null });
  } else if (target_type === 'LINE') {
    targetInserts.push({ pass_id: id, target_type: 'LINE', target_id: target_ids[0] || null });
  } else if (target_type === 'STATION') {
    for (const station_id of target_ids) {
      if (station_id) {
        targetInserts.push({ pass_id: id, target_type: 'STATION', target_id: station_id });
      }
    }
  }

  if (targetInserts.length > 0) {
    const { error: targetError } = await supabase.from('pass_targets').insert(targetInserts);
    if (targetError) throw new Error(targetError.message);
  }

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/admin/passes');
  revalidatePath(`/pass/${slug}`);
}
