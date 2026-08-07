-- schema_comments.sql

-- 1. comments 테이블 생성
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_type VARCHAR(50) NOT NULL, -- 'HOTEL' 또는 'PASS'
  post_slug VARCHAR(255) NOT NULL, -- 해당 포스팅의 slug (고유 주소)
  author_name VARCHAR(100) NOT NULL, -- 작성자 닉네임
  content TEXT NOT NULL, -- 댓글 내용
  is_approved BOOLEAN DEFAULT false, -- 노출 승인 여부 (일반 유저는 기본 false, 관리자는 true)
  is_admin BOOLEAN DEFAULT false, -- 관리자가 작성한 댓글인지 확인
  published_at TIMESTAMPTZ DEFAULT now(), -- 발행 시각 (예약 발행을 위해 사용)
  created_at TIMESTAMPTZ DEFAULT now() -- 실제 데이터베이스에 작성된 시각
);

-- 인덱스 생성 (조회 속도 향상)
CREATE INDEX idx_comments_post ON comments(post_type, post_slug);
CREATE INDEX idx_comments_published_at ON comments(published_at);
