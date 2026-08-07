'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 새 제휴사 등록
 */
export async function addPartner(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized: 관리자만 제휴사를 등록할 수 있습니다.')

  const name      = (formData.get('name')      as string || '').trim()
  const slug      = (formData.get('slug')      as string || '').toLowerCase().trim().replace(/\s+/g, '-')
  const logo_char = (formData.get('logo_char') as string || name.charAt(0)).trim()
  const color_hex = (formData.get('color_hex') as string || '#2563EB').trim()
  const subtitle  = (formData.get('subtitle')  as string || '').trim() || null
  const main_url  = (formData.get('main_url')  as string || '').trim() || null
  const logo_url  = (formData.get('logo_url')  as string || '').trim() || null
  const common_guide = (formData.get('common_guide') as string || '').trim() || null

  if (!name || !slug) throw new Error('제휴사명과 슬러그는 필수입니다.')

  const { error } = await supabase.from('partners').insert({
    name, slug, logo_char, color_hex, subtitle, main_url, logo_url, common_guide, is_active: true,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 슬러그의 제휴사가 등록되어 있습니다. 이름 또는 슬러그를 변경해주세요.");
    }
    throw new Error(error.message)
  }

  revalidatePath('/admin/coupons')
  revalidatePath(`/store/${slug}`)
}

/**
 * 제휴사 삭제
 */
export async function deletePartner(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('partners').delete().eq('id', id)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/coupons')
}

/**
 * 제휴사 수정
 */
export async function updatePartner(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const name      = (formData.get('name')      as string || '').trim()
  const slug      = (formData.get('slug')      as string || '').toLowerCase().trim().replace(/\s+/g, '-')
  const logo_char = (formData.get('logo_char') as string || name.charAt(0)).trim()
  const color_hex = (formData.get('color_hex') as string || '#2563EB').trim()
  const subtitle  = (formData.get('subtitle')  as string || '').trim() || null
  const main_url  = (formData.get('main_url')  as string || '').trim() || null
  const logo_url  = (formData.get('logo_url')  as string || '').trim() || null
  const common_guide = (formData.get('common_guide') as string || '').trim() || null

  if (!name || !slug) throw new Error('제휴사명과 슬러그는 필수입니다.')

  const { error } = await supabase.from('partners').update({
    name, slug, logo_char, color_hex, subtitle, main_url, logo_url, common_guide
  }).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 슬러그의 제휘사가 등록되어 있습니다. 이름 또는 슬러그를 변경해주세요.");
    }
    throw new Error(error.message)
  }

  revalidatePath('/admin/coupons')
  revalidatePath(`/store/${slug}`)
}
