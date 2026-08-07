'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addPost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 포스팅을 등록할 수 있습니다.')
  }

  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string || '여행팁';
  const post_title = formData.get('post_title') as string;
  let content = formData.get('content') as string;
  const linkedPassesRaw = formData.get('linked_pass_ids') as string;
  let linked_pass_ids: string[] = [];
  try {
    if (linkedPassesRaw) {
      linked_pass_ids = JSON.parse(linkedPassesRaw);
    }
  } catch (e) {}

  const linkedAttractionsRaw = formData.get('linked_attraction_ids') as string;
  let linked_attraction_ids: string[] = [];
  try {
    if (linkedAttractionsRaw) {
      linked_attraction_ids = JSON.parse(linkedAttractionsRaw);
    }
  } catch (e) {}

  // SEO를 위해 제목을 본문 최상단에 H2 태그로 삽입
  if (post_title) {
    content = `<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">${post_title}</h2>\n` + content;
  }

  // 사용자가 직접 지정한 썸네일이 있으면 우선 사용, 없으면 content에서 첫 번째 이미지 추출
  const manualThumbnail = (formData.get('thumbnail_url') as string)?.trim();
  let thumbnail_url: string;
  if (manualThumbnail) {
    thumbnail_url = manualThumbnail;
  } else {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = content.match(imgRegex);
    thumbnail_url = match && match[1] 
      ? match[1] 
      : 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80';
  }

  const { error } = await supabase.from('posts').insert({
    title,
    slug,
    description,
    content,
    thumbnail_url,
    category,
    is_published: true,
    linked_pass_ids,
    linked_attraction_ids,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 식별자(Slug)로 등록된 포스팅이 존재합니다. 제목이나 식별자를 변경해주세요.");
    }
    throw new Error(error.message);
  }

  revalidatePath('/')
  revalidatePath('/admin/posts')
}

export async function updatePost(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 포스팅을 수정할 수 있습니다.')
  }

  const id = formData.get('id') as string;
  const title = formData.get('title') as string;
  const slug = formData.get('slug') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string || '여행팁';
  const post_title = formData.get('post_title') as string;
  let content = formData.get('content') as string;
  const linkedPassesRaw = formData.get('linked_pass_ids') as string;
  
  let linked_pass_ids: string[] | undefined;
  try {
    if (linkedPassesRaw) {
      linked_pass_ids = JSON.parse(linkedPassesRaw);
    }
  } catch (e) {}

  const linkedAttractionsRaw = formData.get('linked_attraction_ids') as string;
  let linked_attraction_ids: string[] | undefined;
  try {
    if (linkedAttractionsRaw) {
      linked_attraction_ids = JSON.parse(linkedAttractionsRaw);
    }
  } catch (e) {}

  // SEO를 위해 제목을 본문 최상단에 H2 태그로 삽입
  if (post_title) {
    content = `<h2 class="text-2xl font-extrabold text-slate-900 mb-6 pb-4 border-b border-slate-100">${post_title}</h2>\n` + content;
  }

  // 사용자가 직접 지정한 썸네일이 있으면 우선 사용, 없으면 content에서 첫 번째 이미지 추출
  const manualThumbnail = (formData.get('thumbnail_url') as string)?.trim();
  let thumbnail_url: string;
  if (manualThumbnail) {
    thumbnail_url = manualThumbnail;
  } else {
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
    const match = content.match(imgRegex);
    thumbnail_url = match && match[1] 
      ? match[1] 
      : 'https://images.unsplash.com/photo-1590559899731-a382839e5549?auto=format&fit=crop&w=800&q=80';
  }

  const updateData: any = {
    title,
    slug,
    description,
    content,
    thumbnail_url,
    category,
    updated_at: new Date().toISOString(),
  };

  if (linked_pass_ids !== undefined) {
    updateData.linked_pass_ids = linked_pass_ids;
  }
  if (linked_attraction_ids !== undefined) {
    updateData.linked_attraction_ids = linked_attraction_ids;
  }

  const { error } = await supabase.from('posts').update(updateData).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 식별자(Slug)로 등록된 포스팅이 존재합니다. 제목이나 식별자를 변경해주세요.");
    }
    throw new Error(error.message);
  }

  revalidatePath('/')
  revalidatePath('/admin/posts')
  revalidatePath(`/post/${slug}`)
}

export async function deletePost(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 포스팅을 삭제할 수 있습니다.')
  }

  const { error } = await supabase.from('posts').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/posts')
}

export async function incrementPostView(id: string) {
  const supabase = await createClient()
  try {
    await supabase.rpc('increment_post_view', { post_id: id })
  } catch {
    // rpc가 없을 경우 무시
  }
}

export async function duplicatePost(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 포스팅을 복사할 수 있습니다.')
  }

  const { data: post, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !post) {
    throw new Error('원본 포스팅을 찾을 수 없습니다.')
  }

  // 복사본용 새 Slug 생성 (중복 방지를 위해 랜덤 값 추가)
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  const newSlug = `${post.slug}-copy-${randomSuffix}`;

  const { error: insertError } = await supabase.from('posts').insert({
    title: `${post.title} (복사본)`,
    slug: newSlug,
    description: post.description,
    content: post.content,
    thumbnail_url: post.thumbnail_url,
    category: post.category,
    is_published: false, // 기본적으로 비공개 상태로 생성
    linked_pass_ids: post.linked_pass_ids,
    linked_attraction_ids: post.linked_attraction_ids,
  })

  if (insertError) {
    throw new Error(insertError.message)
  }

  revalidatePath('/admin/posts')
}
