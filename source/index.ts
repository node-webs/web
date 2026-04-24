import path from 'path';
import dotenv from 'dotenv';
import nunjucks from 'nunjucks';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import express, { Express } from 'express';
import morgan, { StreamOptions } from 'morgan';

// [ library ]
import logger from './lib/logger';
import { mw } from './lib/base';
// [ router ]
import webRouter from './page/web.router';
// [ dotenv ]
const envMode = process.env.NODE_ENV || 'web';
const envPath = path.join(process.cwd(), '/aset/data', `.env.${envMode}`);
dotenv.config({ path: envPath });
// [ Express ]
const app: Express = express();
app.set('port', process.env.PORT || 3000);
// [ 템플릿 ]
app.engine('pet', nunjucks.render);
app.set("view engine", "pet");
const env = nunjucks.configure(path.join(__dirname, "../aset/views"), {
    express: app, autoescape: true, watch: true,
});
// [ Morgan ]
const stream: StreamOptions = { write: (message: string) => logger.info(message.trim()) };
const morganFormat: string = envMode === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream, skip: (req, res) => res.statusCode < 400 }));
// [ 정적파일 ]
app.use(express.static(path.join(__dirname, "../publicz")));
app.use("/script", express.static(path.join(__dirname, "../aset/script")));
// [ 데이터 파싱 ]
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// [ 쿠키 서명에 사용할 비밀 키, 서명된 쿠키 사용 시 필요 ]
app.use(cookieParser(process.env.COOKIE_SECRET));
// [ 세션 설정 ]
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET || 'your-secret-key',
    cookie: { 
        httpOnly: true,
        sameSite: 'strict',
        secure: false,
        maxAge: 1000 * 60 * 60   // 1시간 유지
    }
}));
// [ MiddleWar ]
app.use(mw.CsrfPublish);
// [ 라우터 ]
app.use('/', webRouter);
// [ 에러 핸들링 ]
// app.use(error.NotFound);
// app.use(error.errorHandler);

app.listen(app.get('port'), () => {
    console.log(`Server is running on port http://localhost:${app.get('port')}/로그인`);
});