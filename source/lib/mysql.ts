import axios from 'axios';
import path from 'path';
import dotenv from 'dotenv';
import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
// Promise를 지원하여 async/await 코딩이 가능
// RowDataPacket(조회 결과)과 ResultSetHeader(실행 결과) 타입

const envMode = process.env.NODE_ENV || 'web';
const envPath = path.join(process.cwd(), '/aset/data', `.env.${envMode}`);
dotenv.config({ path: envPath });

 console.log('c--------------------------', process.env.DB_USER);
// MySQL 데이터베이스 연결 풀 생성
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    connectionLimit: 10, // 최대 10개의 연결을 미리 만들어두고 재사용
    waitForConnections: true, // 10개가 모두 사용 중일 때 새로운 요청이 오면 에러를 내지 않고 빈 자리가 날 때까지 기다림
    queueLimit: 0 // 대기열에 제한을 두지 않아 요청이 밀려도 차례대로 처리
});


/**
 * 관리자에게 슬랙 알림을 보내는 함수
 */

// 알림 중복 방지를 위한 시간 체크
let lastAlertTime = 0;

async function sendKakaoAlert(message: string) {
    try {
        await axios.post(
            'https://kakao.com',
            new URLSearchParams({
                template_object: JSON.stringify({
                    object_type: 'text',
                    text: `🚨 [DB 경고]\n${message}\n발생시각: ${new Date().toLocaleString()}`,
                    link: {
                        web_url: 'http://your-admin-page.com',
                        mobile_web_url: 'http://your-admin-page.com',
                    },
                }),
            }),
            {
                headers: {
                    'Authorization': `Bearer ${process.env.KAKAO_ACCESS_TOKEN}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
        );
    } catch (error: any) {
        console.error('카카오 알림 전송 실패:', error.response?.data || error.message);
    }
}
/** 
 * 2. 연결 대기 이벤트 리스너 등록
 * pool 객체 생성 직후, 내보내기 전에 작성합니다.
 */
pool.on('enqueue', () => {
    // 11번째 동시 요청이 들어오는 순간 즉시 enqueue 이벤트가 발생
    // 서비스 운영 중 이 로그가 자주 찍힌다면 connectionLimit 수치를 늘리거나
    // 쿼리 성능을 개선해야 한다는 확실한 근거

    // console.warn 대신 Sentry나 Slack Webhook 등을 연결하면 서버실에 앉아있지 않아도 DB 부하 상태를 즉시 알 수 있습니다.
    console.warn(`[${new Date().toISOString()}] ⚠️ 경고: 모든 DB 연결이 사용 중입니다. 요청이 대기열(Queue)에 추가되었습니다.`);

    // 카카오 알람, 10분에 한 번씩만 알림 (알림 폭탄 방지)
    // const now = Date.now();
    // if (now - lastAlertTime > 10 * 60 * 1000) {
    //     sendKakaoAlert('DB 커넥션 풀 부족으로 인한 대기열 발생!');
    //     lastAlertTime = now;
    // }


    // 카카오
    // '카카오톡 메시지 API(나에게 보내기)'를 이용하거나, 서비스 규모가 크다면 '알림톡(비즈니스 채널)' 서비스를 사용하는 것입니다.
    // 여기서는 개발 시 즉시 적용할 수 있도록 카카오 API(나에게 보내기)를 기준으로 구현 흐름을 설명해 드릴게요.
    // 1. 사전 준비 (카카오 개발자 센터)
    // 카카오 개발자 센터에서 앱을 생성합니다.
    // '카카오 로그인' 기능을 활성화하고, talk_message 권한(나에게 보내기)을 설정합니다.
    // 액세스 토큰(Access Token)을 발급받아야 합니다. (실제 운영 시에는 Refresh Token을 이용해 자동 갱신 로직이 필요합니다.)
});

// (참고) 연결이 새로 만들어졌을 때 알림
pool.on('connection', (connection) => {
    console.log(`[${new Date().toISOString()}] 🔌 새로운 DB 연결이 생성되었습니다. (Thread ID: ${connection.threadId})`);
});


// 공통 쿼리 함수 객체
const db = {
    /**
     * SELECT 쿼리 실행 (목록 조회)
     * db.select: 데이터를 가져오는(Read) 용도
     * select<T> : 제네릭을 사용해 호출, T는 반환될 데이터의 타입을 지정
    */

    async select<T extends RowDataPacket>(sql: string, params?: any[]): Promise<T[]> {
        const [rows] = await pool.execute<T[]>(sql, params);
        return rows;
    },

    /**
     * INSERT, UPDATE, DELETE 쿼리 실행
     * db.execute: 데이터를 변경(Write/Delete)하고 영향받은 행의 수 등을 확인하는 용도
     * 영향받은 행의 수나 삽입된 ID 등을 반환합니다.
    */

    async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);
        return result;
    }
};

export default db;