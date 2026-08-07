'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addMenu(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 메뉴를 등록할 수 있습니다.')
  }

  const title = formData.get('title') as string;
  const url = formData.get('url') as string;
  const sort_order = parseInt(formData.get('sort_order') as string) || 0;

  const { error } = await supabase.from('menus').insert({
    title,
    url,
    sort_order,
    is_active: true,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 메뉴가 등록되어 있습니다. 메뉴명 또는 URL을 변경해주세요.");
    }
    throw new Error(error.message);
  }

  revalidatePath('/')
  revalidatePath('/admin/menus')
}

export async function updateMenu(id: string, title: string, url: string, sort_order: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 메뉴를 수정할 수 있습니다.')
  }

  const { error } = await supabase.from('menus').update({
    title,
    url,
    sort_order,
  }).eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/menus')
}

export async function deleteMenu(id: string) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 메뉴를 삭제할 수 있습니다.')
  }

  const { error } = await supabase.from('menus').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/menus')
}

export async function toggleMenuActive(id: string, is_active: boolean) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized')
  }

  const { error } = await supabase.from('menus').update({ is_active }).eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin/menus')
}
