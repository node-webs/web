import 'express-session'; // SessionData 확장을 위해 필요
import * as express from 'express';

import { IUser } from '../library/interfaces';

declare module 'express-session' {
    interface SessionData {
        csrfToken?: string;
        user?: {
            id: string;
            email: string;
        };
    }
}

declare global {
    namespace Express {
        interface Locals {
            csrfToken1?: string;
            csrfToken2?: string;
            isSignin?: boolean;
            title?: string;
            user?: IUser;
        }
        // Passport 라이브러리를 사용한다면, Express.User 인터페이스를 사용
        // User를 사용하지 않고, 따로 타입이 정해져 있다면 ILoginUser와 같이 병합합니다.
        interface User extends IUser {}
    }
}

 // 만약 req.locals를 직접 사용하려 했던 것이라면 아래를 추가하세요.
    // (Express 기본 Request에는 locals가 없으므로 직접 추가가 필요합니다)
    // interface Request {
    //   locals: Locals;
    // }