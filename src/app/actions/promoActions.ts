'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 신규 제휴사 할인코드 등록
 * - condition, expiry, is_active, meta_title, meta_description, seo_content 지원
 */
export async function addPromoCode(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized: 오직 관리자만 할인코드를 관리할 수 있습니다.')

  const partner_name   = formData.get('partner_name')   as string
  const promo_code     = (formData.get('promo_code') as string || '').toUpperCase().trim()
  const discount_rate  = formData.get('discount_rate')  as string
  const target_url     = formData.get('target_url')     as string

  // 조건 / 유효기간 → description 조합
  const condition      = (formData.get('condition')     as string | null)?.trim() || null
  const expiry         = (formData.get('expiry')        as string | null)?.trim() || null
  const descriptionRaw = (formData.get('description')   as string | null)?.trim() || null

  // is_active
  const isActiveRaw = formData.get('is_active') as string | null
  const is_active   = isActiveRaw === null ? true : isActiveRaw === 'true'

  // SEO 필드
  const meta_title_raw       = (formData.get('meta_title')       as string | null)?.trim() || null
  const meta_description_raw = (formData.get('meta_description') as string | null)?.trim() || null
  const seo_content_raw      = (formData.get('seo_content')      as string | null)?.trim() || null

  const image_url_raw        = (formData.get('image_url')        as string | null)?.trim() || null

  const expires_at_raw       = (formData.get('expires_at')       as string | null)?.trim() || null
  const expires_at           = expires_at_raw ? new Date(expires_at_raw).toISOString() : null

  if (!partner_name || !promo_code || !discount_rate || !target_url) {
    throw new Error('필수 입력값이 누락되었습니다.')
  }

  // description 조합
  let description: string | null = null
  if (condition || expiry) {
    const parts: string[] = []
    if (condition) parts.push(`조건: ${condition}`)
    if (expiry)    parts.push(`유효기간: ${expiry}`)
    description = parts.join(' / ')
  } else if (descriptionRaw) {
    description = descriptionRaw
  }

  // SEO 제목 자동 생성 (비어 있으면)
  const meta_title = meta_title_raw
    || `${partner_name} 할인코드 | ${discount_rate} | 도쿄트립`

  // SEO 설명 자동 생성 (비어 있으면)
  const meta_description = meta_description_raw
    || `${partner_name} ${discount_rate} 할인코드를 지금 바로 사용하세요. ${description || ''} 검증된 최신 할인쿠폰을 지금 바로 사용하세요.`

  const seo_content = seo_content_raw || null
  const image_url = image_url_raw || null

  const { error } = await supabase.from('promo_codes').insert({
    partner_name,
    promo_code,
    discount_rate,
    target_url,
    description,
    is_active,
    meta_title,
    meta_description,
    seo_content,
    image_url,
    expires_at,
  })

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 할인코드가 등록되어 있습니다. 할인코드를 변경해주세요.");
    }
    throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/coupons')
  revalidatePath('/store/agoda')
  revalidatePath('/store/hotels')
  revalidatePath('/store/klook')
}


/**
 * 제휴사 할인코드 삭제
 */
export async function deletePromoCode(id: string) {
  const supabase = await createClient()

  // 서버 사이드 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 할인코드를 관리할 수 있습니다.')
  }

  const { error } = await supabase.from('promo_codes').delete().eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  // 캐시 즉시 갱신
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/coupons')
}

/**
 * 제휴사 할인코드 수정
 */
export async function updatePromoCode(id: string, formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const partner_name   = formData.get('partner_name')   as string
  const promo_code     = (formData.get('promo_code') as string || '').toUpperCase().trim()
  const discount_rate  = formData.get('discount_rate')  as string
  const target_url     = formData.get('target_url')     as string

  const condition      = (formData.get('condition')     as string | null)?.trim() || null
  const expiry         = (formData.get('expiry')        as string | null)?.trim() || null
  const descriptionRaw = (formData.get('description')   as string | null)?.trim() || null

  const isActiveRaw = formData.get('is_active') as string | null
  const is_active   = isActiveRaw === null ? true : isActiveRaw === 'true'

  const meta_title_raw       = (formData.get('meta_title')       as string | null)?.trim() || null
  const meta_description_raw = (formData.get('meta_description') as string | null)?.trim() || null
  const seo_content_raw      = (formData.get('seo_content')      as string | null)?.trim() || null

  const image_url_raw        = (formData.get('image_url')        as string | null)?.trim() || null

  const expires_at_raw       = (formData.get('expires_at')       as string | null)?.trim() || null
  const expires_at           = expires_at_raw ? new Date(expires_at_raw).toISOString() : null

  if (!partner_name || !promo_code || !discount_rate || !target_url) {
    throw new Error('필수 입력값이 누락되었습니다.')
  }

  let description: string | null = null
  if (condition || expiry) {
    const parts: string[] = []
    if (condition) parts.push(`조건: ${condition}`)
    if (expiry)    parts.push(`유효기간: ${expiry}`)
    description = parts.join(' / ')
  } else if (descriptionRaw) {
    description = descriptionRaw
  }

  const meta_title = meta_title_raw
    || `${partner_name} 할인코드 | ${discount_rate} | 도쿄트립`

  const meta_description = meta_description_raw
    || `${partner_name} ${discount_rate} 할인코드를 지금 바로 사용하세요. ${description || ''} 검증된 최신 할인쿠폰을 지금 바로 사용하세요.`

  const seo_content = seo_content_raw || null
  const image_url = image_url_raw || null

  const { error } = await supabase.from('promo_codes').update({
    partner_name,
    promo_code,
    discount_rate,
    target_url,
    description,
    is_active,
    meta_title,
    meta_description,
    seo_content,
    image_url,
    expires_at,
  }).eq('id', id)

  if (error) {
    if (error.code === '23505') {
      throw new Error("이미 동일한 할인코드가 등록되어 있습니다. 할인코드를 변경해주세요.");
    }
    throw new Error(error.message)
  }

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/coupons')
  revalidatePath('/store/agoda')
  revalidatePath('/store/hotels')
  revalidatePath('/store/klook')
}

/**
 * 여러 제휴사 할인코드 일괄 삭제
 */
export async function deletePromoCodes(ids: string[]) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  if (!ids || ids.length === 0) return

  const { error } = await supabase.from('promo_codes').delete().in('id', ids)

  if (error) throw new Error(error.message)

  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/admin/coupons')
}

