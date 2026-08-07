'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * 활성 프로모션 월 설정 업데이트
 */
export async function updatePromoMonthSetting(formData: FormData) {
  const supabase = await createClient()

  // 서버 사이드 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 설정을 편집할 수 있습니다.')
  }

  const promoMonth = formData.get('active_promo_month') as string

  if (!promoMonth) {
    throw new Error('프로모션 월 입력값이 비어 있습니다.')
  }

  // upsert
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: 'active_promo_month', value: promoMonth.trim() },
      { onConflict: 'key' }
    )

  if (error) {
    throw new Error(error.message)
  }

  // 관련 모든 캐시 즉각 무효화
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/store/agoda')
  revalidatePath('/store/hotels')
  revalidatePath('/store/klook')
}

/**
 * 사이드바 프로모션 코드 업데이트
 */
export async function updateSidebarPromos(promoIds: string[]) {
  const supabase = await createClient()

  // 서버 사이드 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 설정을 편집할 수 있습니다.')
  }

  // upsert
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: 'sidebar_promo_ids', value: JSON.stringify(promoIds) },
      { onConflict: 'key' }
    )

  if (error) {
    throw new Error(error.message)
  }

  // 관련 모든 캐시 즉각 무효화
  revalidatePath('/')
  revalidatePath('/admin')
  revalidatePath('/hotel/[slug]', 'page')
}

/**
 * 호텔 개별 사이드바 프로모션 코드 업데이트
 */
export async function updateHotelSidebarPromos(hotelId: string, promoIds: string[]) {
  const supabase = await createClient()

  // 서버 사이드 관리자 권한 확인
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Unauthorized: 오직 관리자만 설정을 편집할 수 있습니다.')
  }

  // upsert
  const { error } = await supabase
    .from('site_settings')
    .upsert(
      { key: `hotel_sidebar_promo_ids_${hotelId}`, value: JSON.stringify(promoIds) },
      { onConflict: 'key' }
    )

  if (error) {
    throw new Error(error.message)
  }

  // 관련 모든 캐시 즉각 무효화
  revalidatePath('/admin')
  revalidatePath('/hotel/[slug]', 'page')
}
