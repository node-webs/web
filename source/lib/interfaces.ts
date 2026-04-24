import { RowDataPacket } from 'mysql2';

// 재사용 가능한 커스텀 타입 정의
export type PetKind = 'cat' | 'dog';
export type AuthProvider = 'local' | 'kakao' | 'google';
export type UserRole = 'user' | 'blogger' | 'partner' | 'admin';

// 사용자 데이터 타입 정의
export interface IUser extends RowDataPacket {
    id: number;
    email: string;
    name?: string | null;
    phoneNumber: string | null;     // 전화번호 항목 추가
    petTypes: PetKind[]; // 사용자 유형을 배열로 저장 (예: ['cat', 'dog'])
    roles: UserRole[]; // 여러 역할을 가질 수 있으므로 배열로 처리
    password?: string | null; // SNS 가입자는 null
    passwordChangedAt: Date;
    provider: AuthProvider; // 가입 경로 구분
    snsId?: string | null; // SNS에서 제공하는 고유 ID (예: 12345678)
    isActive: 0 | 1;
    createdAt: Date;   
}

// 응답 데이터 타입을 위한 인터페이스 (필요 시)
export interface EmailCheckUserRow extends RowDataPacket {
    id: number;
    email: string;
}