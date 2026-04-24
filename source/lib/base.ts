import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

// check
const ck = {
    signin: [
        body('email').isEmail().withMessage('이메일을 확인해주세요.'),
        body('password').notEmpty().isLength({ min: 6, max: 20 }).withMessage('비밀번호는 최소 6자 이상입니다.'),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).set('Content-Type', 'application/json; charset=utf-8').json({ errors: errors.array() });
            next();
        }
    ],
    signup: [
        body('email')
            .isEmail().withMessage('유효한 이메일 형식이 아닙니다.')
            .isLength({ max: 100 }).withMessage('이메일은 100자 이내여야 합니다.'),
        
        body('password')
            .isLength({ min: 6, max: 20 }).withMessage('비밀번호는 6자 이상 20자 이하여야 합니다.')
            .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('특수문자를 하나 이상 포함해야 합니다.'),
        
        // body('type')
        //     .custom((value) => {
        //         // 체크박스가 하나도 체크 안 될 경우 undefined 대응
        //         if (!value) return true; 
        //         const selected = Array.isArray(value) ? value : [value];
        //         const allowed = ['cat', 'dog', 'etc'];
        //         const isInvalid = selected.some(item => !allowed.includes(item));
        //         if (isInvalid) throw new Error('올바른 반려동물 타입을 선택해주세요.');
        //         return true;
        //     }),

        // 결과 처리 미들웨어
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).set('Content-Type', 'application/json; charset=utf-8').json({ success: false, errors: errors.array() });
            }
            next();
        }
    ],
    checkEmail: [
        body('email').isEmail().withMessage('이메일을 22확인해주세요.'),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).set('Content-Type', 'application/json; charset=utf-8').json({ errors: errors.array() });
            next();
        }
    ],
    petRegistration: [
        body('name').notEmpty().withMessage('이름을 입력해주세요.').isLength({ max: 50 }),
        body('type').isIn(['dog', 'cat']).withMessage('올바른 타입을 선택해주세요.'),
        body('breed').optional().isLength({ max: 50 }),
        (req: Request, res: Response, next: NextFunction) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
            next();
        }
    ],
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

        console.log('csrf---verify.....', clientToken);

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

const error = {
    NotFound: (req: Request, res: Response, next: NextFunction) => {
        res.status(404).json({ errors: { msg: '페이지를 찾을 수 없습니다.' } });
    },
    errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => {
        console.error(err.stack);
        res.status(500).json({ error: '서버 에러가 발생했습니다.' });
    }
};

export { ck, error, mw };