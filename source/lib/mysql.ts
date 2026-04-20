import mysql, { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
// Promise를 지원하여 async/await 코딩이 가능

// MySQL 데이터베이스 연결 풀 생성
const pool: Pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 공통 쿼리 함수 객체
const db = {
    /**
     * SELECT 쿼리 실행 (목록 조회)
     * T는 반환될 데이터의 타입을 지정합니다.
    */

    async select<T extends RowDataPacket>(sql: string, params?: any[]): Promise<T[]> {
        const [rows] = await pool.execute<T[]>(sql, params);
        return rows;
    },

    /**
     * INSERT, UPDATE, DELETE 쿼리 실행
     * 영향받은 행의 수나 삽입된 ID 등을 반환합니다.
    */

    async execute(sql: string, params?: any[]): Promise<ResultSetHeader> {
        const [result] = await pool.execute<ResultSetHeader>(sql, params);
        return result;
    }
};

export default db;