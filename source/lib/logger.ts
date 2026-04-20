import path from 'path';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logDir: string = process.env.LOGGER_DIR || path.join(process.cwd(), 'logs'); // 로그 저장 폴더

const logger = winston.createLogger({
    level: 'info', // 기록할 최소 로그 레벨 (info, warn, error)
    format: winston.format.combine(
        // 로그 포맷 정의: [타임스탬프] [레벨]: 메시지
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.json() // 서비스 환경에서는 검색이 쉬운 JSON 포맷 권장
    ),
    transports: [
        // 1. 모든 로그(info 이상)를 날짜별로 저장
        new DailyRotateFile({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: '%DATE%.log',
            maxFiles: '30d', // 30일치 로그만 보관하고 나머지는 자동 삭제
            zippedArchive: true, // 압축해서 저장 (용량 절약)
        }),
        // 2. 에러 로그만 따로 모아서 저장
        new DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: path.join(logDir, 'error'),
            filename: '%DATE%.error.log',
            maxFiles: '30d',
            zippedArchive: true,
        }),
    ],
});

// 개발 환경일 경우 콘솔 출력 추가 (색상 적용)
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(), // 로그 레벨별로 색상 적용 (info: 초록, error: 빨강 등)
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`) // 콘솔에서 보기 편한 형식
      ),
    })
  );
}

export default logger;