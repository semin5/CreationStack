CREATE DATABASE CreationStack;
USE CreationStack;

CREATE TABLE jobs( -- 직업 테이블
   job_id INT PRIMARY KEY AUTO_INCREMENT,
   name VARCHAR(50) NOT NULL UNIQUE
);
-- 직업 데이터
INSERT INTO job (name) VALUES 
('Frontend Developer'),
('Backend Developer'),
('Full Stack Developer'),
('iOS Developer'),
('Android Developer'),
('Game Developer'),
('System Engineer'),
('AI/ML Engineer'),
('DevOps Engineer'),
('Data Engineer'),
('Security Engineer'),
('UX/UI Designer'),
('Product Manager'),
('Product Owner'),
('Game Designer'),
('Brand Designer'),
('HR/Recruiters'),
('Career Consultant'),
('Mentors');

CREATE TABLE users ( -- 유저 테이블
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    role ENUM('USER', 'CREATOR') NOT NULL,
    job_id INT, -- 직업 선택
    subscriber_count INT NOT NULL DEFAULT 0, -- 구독자 수
    is_active BOOLEAN DEFAULT TRUE, -- 탈퇴여부(true면 활동 중)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES job(job_id)
);

CREATE TABLE user_detail ( -- 유저 개인정보 테이블(탈퇴 시 삭제)
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(50) NOT NULL, -- 실명
    nickname VARCHAR(50) NOT NULL UNIQUE, -- 닉네임
    bio TEXT, -- 간단한 소개글
    profile_image_url VARCHAR(255),
    platform_id VARCHAR(255),
    platform ENUM('LOCAL','KAKAO') NOT NULL, 
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(512),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE token ( 
    token_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    refresh_token VARCHAR(512) NOT NULL UNIQUE,
    issued_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 토큰 발급 일시 
    expire_at DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_detail(user_id),
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE
);


CREATE TABLE content ( -- 콘텐츠 테이블
    content_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    thumbnail_url VARCHAR(512) NOT NULL,
    view_count INT NOT NULL DEFAULT 0,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL,
    access_type ENUM('FREE', 'SUBSCRIBER') NOT NULL DEFAULT 'FREE',  -- 무료/유료 구분
    FOREIGN KEY (creator_id) REFERENCES users(user_id)
);


CREATE TABLE attachment ( -- 첨부파일 테이블
    attachment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    content_id BIGINT NOT NULL,
    file_url VARCHAR(512) NOT NULL, -- 길이 확장
    original_file_name VARCHAR(100),
    stored_file_name VARCHAR(255) NOT NULL, -- 추가: S3에 저장된 실제 파일명 (UUID 등)
    file_type VARCHAR(50) NOT NULL, -- 추가: 파일 MIME 타입
    file_size BIGINT,
    FOREIGN KEY (content_id) REFERENCES content(content_id)
);

CREATE TABLE `like` ( -- 콘텐츠 좋아요 테이블
    like_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content_id BIGINT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,  -- 좋아요 취소시 FALSE 
    UNIQUE KEY uq_user_content (user_id, content_id), -- 중복 방지
    INDEX idx_content_user (user_id, is_active, created_at),   -- 조회 최적화
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (content_id) REFERENCES content(content_id)
);

CREATE TABLE category ( -- 카테고리 테이블
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO category (name) VALUES  -- 카테고리 데이터
('개발'),
('디자인'),
('기획'),
('데이터'),
('커리어');

CREATE TABLE content_category ( -- 콘텐츠-카테고리 중간 테이블
    content_id BIGINT,
    category_id INT,
    PRIMARY KEY (content_id, category_id),
    FOREIGN KEY (content_id) REFERENCES content(content_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);

CREATE TABLE comment ( -- 댓글 테이블
    comment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    content_id BIGINT NOT NULL,
    parent_comment_id BIGINT DEFAULT NULL,
    content TEXT NOT NULL,
    like_count INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (content_id) REFERENCES content(content_id),
    FOREIGN KEY (parent_comment_id) REFERENCES comment(comment_id)
);

CREATE TABLE comment_like ( -- 댓글 좋아요 테이블
    like_id BIGINT AUTO_INCREMENT PRIMARY KEY, 
    comment_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE KEY uq_user_comment (user_id, comment_id),
    FOREIGN KEY (comment_id) REFERENCES comment(comment_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE notice ( -- 크리에이터 공지 테이블
    notice_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    creator_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    image_url VARCHAR(512),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(user_id)
);

CREATE TABLE notice_reaction ( -- 공지 리액션 테이블
    notice_reaction_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notice_id BIGINT,
    user_id BIGINT,
    emoji VARCHAR(10) NOT NULL,
    UNIQUE (notice_id, user_id, emoji),
    FOREIGN KEY (notice_id) REFERENCES notice(notice_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE payment_method ( -- 결제수단 등록
    payment_method_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    billing_key VARCHAR(255),  -- PG사에서 발급한 정기결제 식별자
    card_name VARCHAR(100) NOT NULL, -- 카드사 이름(신한카드 등)
    card_number VARCHAR(50) NOT NULL, -- 마스킹된 카드번호
    card_type VARCHAR(50), -- 신용(CREDIT), 체크(DEBIT) 영문명 기입
	  card_brand VARCHAR(50), -- 카드 브랜드(MASTER, VISA 등)
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE subscription_status ( -- 구독 상태 테이블
    status_id INT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100)
);

/* 초기 데이터 삽입 */
INSERT INTO subscription_status (status_id, name, description) VALUES
(1, 'PENDING', '결제 대기 상태'),
(2, 'ACTIVE', '구독 활성 상태'),
(3, 'CANCELLED', '사용자에 의한 취소'),
(4, 'EXPIRED', '유효기간 만료');

CREATE TABLE subscription ( -- 구독 테이블
    subscription_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    subscriber_id BIGINT NOT NULL, -- 구독 요청한 사용자 ID
    creator_id BIGINT NOT NULL,  -- 대상 크리에이터 ID
    payment_method_id BIGINT,
    
    amount INT NOT NULL,    
    status_id INT NOT NULL DEFAULT 1,  -- 기본값: PENDING
    
    started_at DATETIME NOT NULL,
    next_payment_at DATETIME NOT NULL,
    last_payment_at DATETIME,
    
   
    UNIQUE KEY subscriber_creator (subscriber_id, creator_id),
    
    FOREIGN KEY (payment_method_id) REFERENCES payment_method(payment_method_id) ON DELETE SET NULL,
    FOREIGN KEY (subscriber_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (status_id) REFERENCES subscription_status(status_id)
);

CREATE TABLE payment ( -- 결제 내역 저장 테이블
  payment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_method_id BIGINT,
  subscription_id BIGINT NOT NULL, 
  amount INT NOT NULL,
  payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL,
  transaction_id VARCHAR(255) UNIQUE, -- PG사 결제 고유번호
  failure_reason TEXT,
  try_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 결제 시도 시각
  success_at DATETIME DEFAULT NULL, -- 결제 완료 시각 (실패되었을 경우 NULL)
  FOREIGN KEY (subscription_id) REFERENCES subscription(subscription_id) ON DELETE CASCADE,
  FOREIGN KEY (payment_method_id) REFERENCES payment_method(payment_method_id) ON DELETE SET NULL
);