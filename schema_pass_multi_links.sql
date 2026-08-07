-- passes 테이블에 다중 제휴 링크를 담을 JSONB 컬럼 추가
ALTER TABLE passes ADD COLUMN IF NOT EXISTS affiliate_links JSONB DEFAULT '[]'::jsonb;

-- 기존 affiliate_url 데이터를 affiliate_links JSON 배열로 마이그레이션 (선택 사항)
-- 이 쿼리를 실행하면 기존에 입력된 단일 링크가 자동으로 새 시스템에 맞게 변환됩니다.
UPDATE passes
SET affiliate_links = jsonb_build_array(
  jsonb_build_object(
    'platform', '기본링크', 
    'url', affiliate_url
  )
)
WHERE affiliate_url IS NOT NULL AND affiliate_url != '';
