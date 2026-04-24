CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    name VARCHAR(50) DEFAULT NULL,
    phoneNumber VARCHAR(20) DEFAULT NULL,
    petType set('cat','dog') NULL DEFAULT '', -- 'cat', 'dog', 'cat,dog'(둘 다), 또는 ''(비어있음)
    roles SET('user', 'blogger', 'partner', 'admin') DEFAULT 'user',
    password VARCHAR(255) DEFAULT NULL, -- SNS 로그인을 위해 NULL 허용
    passwordChangedAt DATETIME DEFAULT CURRENT_TIMESTAMP, -- 비밀번호 변경 시점 기록
    provider ENUM('local', 'kakao', 'google') NOT NULL DEFAULT 'local',
    snsId VARCHAR(100) DEFAULT NULL,    -- SNS 고유 식별자 저장
    isActive tinyint(1) DEFAULT '1',
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    -- 인덱스 및 제약 조건 설정
    UNIQUE KEY unique_email (email), -- 1. 이메일 중복 방지 추가
    UNIQUE KEY unique_phone (phoneNumber), -- 전화번호 중복 가입 방지
    UNIQUE KEY unique_sns_provider (snsId, provider) -- 2. 동일 SNS ID 중복 방지
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;


-- 1. 일반 로컬 회원 (강아지만 키움)
INSERT INTO users (email, name, phoneNumber, petType, roles, password, provider) 
VALUES ('user1@example.com', '김철수', '010-1234-5678', 'dog', 'user', 'hash_password_123', 'local');

-- 2. 카카오 로그인 회원 (고양이, 강아지 둘 다 키움)
INSERT INTO users (email, name, phoneNumber, petType, roles, provider, snsId) 
VALUES ('kakao_user@kakao.com', '이영희', '010-9876-5432', 'cat,dog', 'user', 'kakao', 'kakao_unique_id_001');

-- 3. 구글 로그인 회원 (펫 정보 없음, 블로거 권한)
INSERT INTO users (email, name, phoneNumber, petType, roles, provider, snsId) 
VALUES ('google_pro@gmail.com', '박민수', '010-5555-4444', '', 'user,blogger', 'google', 'google_unique_id_002');

-- 4. 관리자 계정 (고양이만 키움, 여러 권한 보유)
INSERT INTO users (email, name, phoneNumber, petType, roles, password, provider) 
VALUES ('admin@mysite.com', '관리자', '010-0000-0000', 'cat', 'user,blogger,partner,admin', 'admin_hash_999', 'local');

-- 5. 파트너 회원 (비활성화 상태 예시)
INSERT INTO users (email, name, phoneNumber, petType, roles, password, provider, isActive) 
VALUES ('partner_kim@business.com', '김파트너', '010-1111-2222', '', 'user,partner', 'partner_pwd_777', 'local', 0);
