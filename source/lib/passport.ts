import bcrypt from 'bcrypt';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as KakaoStrategy } from 'passport-kakao';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

import db from './mysql';
import { IUser } from './interfaces';

export default function passportConfig() {

    // 로컬 회원가입 전략
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // name, phoneNumber, petType 등을 받기 위해 필요
    }, async (req, email, password, done) => {
        try {
            // 1. 이메일 중복 체크 (provider='local'인 경우만 혹은 전체)
            const existingUsers = await db.select<IUser>(
                'SELECT * FROM users WHERE email = ?', 
                [email]
            );

            if (existingUsers.length > 0) {
                return done(null, false, { message: '이미 가입된 이메일입니다.' });
            }

            // 2. 비밀번호 해싱
            const hashedPassword = await bcrypt.hash(password, 10);

            // 3. 추가 필드 추출 (req.body)
            const { name, phoneNumber, petType } = req.body;

            // 4. DB 저장
            const result = await db.execute(
                `INSERT INTO users (email, password, name, phoneNumber, petType, provider) 
                 VALUES (?, ?, ?, ?, ?, 'local')`,
                [email, hashedPassword, name || null, phoneNumber || null, petType || '']
            );

            const newUser = { 
                id: result.insertId, 
                email, 
                name, 
                provider: 'local' 
            };

            return done(null, newUser as IUser);
        } catch (error) {
            return done(error);
        }
    }));

    // 로컬 로그인 전략 (이메일/비밀번호)
    // passport.use()는 Passport라는 거대한 보관함에 특정 인증 도구(전략)를 이름표를 붙여 저장
    // new LocalStrategy() 객체를 생성하면, 이 객체 내부에는 기본적으로 'local'이라는 이름이 지정되어 있습니다.
    // 따라서 passport.use(new LocalStrategy(...))로 등록하면, 'local'이라는 이름으로 이 전략이 저장됩니다.

    // passport.authenticate('local', ...)로 호출할 때, Passport는 'local'이라는 이름으로 저장된 전략을 찾아 실행합니다.
    passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    }, async (email, password, done) => {
        try {
            const users = await db.select<IUser>(
                'SELECT * FROM users WHERE email = ? AND provider = "local"', 
                [email]
            );

            if (users.length === 0) {
                return done(null, false, { message: '존재하지 않는 사용자입니다.' });
            }
            const user = users[0];

            const isMatch = await bcrypt.compare(password, user.password!); // password(!)는 null이 아님이 보장됨 (로컬 가입자만 해당)
            if (!isMatch) return done(null, false, { message: '비밀번호가 일치하지 않습니다.' });

            // --- 비밀번호 변경 주기 체크 (예: 90일) ---
            const lastChanged = new Date(user.passwordChangedAt);
            const now = new Date();
            const diffDays = Math.floor((now.getTime() - lastChanged.getTime()) / (1000 * 60 * 60 * 24));
            
            let needsPasswordChange = false;

            // 1. 마지막 변경일로부터 90일이 지났는가?
            if (diffDays >= 90) {
                // 2. 만약 연기를 했다면, 그 연기 기한이 지금보다 지났는가?
                if (!user.passwordSkipUntil || new Date(user.passwordSkipUntil) <= now) {
                    needsPasswordChange = true;
                }
            }

            // 유저 객체에 변경 필요 여부를 동적으로 추가
            (user as any).needsPasswordChange = needsPasswordChange;

            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }));

    
}
