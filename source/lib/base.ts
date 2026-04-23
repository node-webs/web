import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// check
const ck = {
    SignIn: (req: Request, res: Response, next: NextFunction) => {},
    signUp: (req: Request, res: Response, next: NextFunction) => {}
}
// middleware
const mw = {
    isAuthenticated: (req: Request, res: Response, next: NextFunction) => {
        if (req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/auth/signin');
        }
    },
    isNotAuthenticated: (req: Request, res: Response, next: NextFunction) => {
        if (!req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/');
        }
    },
    CsrfPublish : (req: Request, res: Response, next: NextFunction) => {
        if (!req.session.csrfToken) {
            // 세션에 토큰이 없으면 새로 생성 (최초 1회)
            // CSRF 방어의 핵심은 "서버가 기억하는 값"과 "클라이언트가 보낸 값"을 대조

            // req.sessio.csrfToken은 index.d.ts
            // module 'express-session'의 interface SessionData에서 정의한 확장한 속성입니다.
            req.session.csrfToken = crypto.randomBytes(32).toString('hex');
         }
         next();
    },
    CsrfVerify : (req: Request, res: Response, next: NextFunction) => {
        const serverToken = req.session.csrfToken;
        const clientToken = req.headers['x-csrf-token'] || req.body._csrf;

        if (!clientToken || serverToken !== clientToken) {
            // 토큰 부재 및 불일치 통합 검증
            return res.status(403).json({ 
                errors: { msg: '서버가 바빠서, 명령이 지연되고 있습니다.' } 
            });
        }
        next();
    },
    csrfSplitter : (req: Request, res: Response, next: NextFunction) => {
        const fullToken = req.session.csrfToken || '';
        const mid = Math.floor(fullToken.length / 2);
        res.locals.csrfPart1 = fullToken.substring(0, mid);
        res.locals.csrfPart2 = fullToken.substring(mid);
        next();
    }
};

export { ck, mw };