import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// 1. 인증 확인
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/auth/signin');
  }
};

// 2. 미인증 확인 (로그인 페이지 접근 제한 등)
export const isNotAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};

// 3. CSRF 토큰 발행
export const CsrfPublish = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  next();
};

// 4. CSRF 토큰 검증
export const CsrfVerify = (req: Request, res: Response, next: NextFunction) => {
  const serverToken = req.session.csrfToken;
  const clientToken = req.headers['x-csrf-token'] || req.body._csrf;
  
  if (!clientToken || serverToken !== clientToken) {
    return res.status(403).json({ 
      errors: { msg: '서버가 바빠서, 명령이 지연되고 있습니다.' } 
    });
  }
  next();
};

// 5. CSRF 토큰 분할 (프론트엔드 전달용)
export const csrfSplitter = (req: Request, res: Response, next: NextFunction) => {
  const fullToken = req.session.csrfToken || '';
  const mid = Math.floor(fullToken.length / 2);
  res.locals.csrfPart1 = fullToken.substring(0, mid);
  res.locals.csrfPart2 = fullToken.substring(mid);
  next();
};