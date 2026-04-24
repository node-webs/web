import { Request, Response } from 'express';
import db from '../lib/mysql';
import { EmailCheckUserRow } from '../lib/interfaces';
const view = {
    SignIn: (req: Request, res: Response) => {
        res.render('sign', { title: 'PET : 로그인', isSignin: true });
    },
    SignUp: (req: Request, res: Response) => {
        res.render('sign', { title: 'PET : 회원가입', isSignin: false });
    },
}

const process = {
    SignIn: (req: Request, res: Response) => {
        console.log(req.body);
        res.json({ message: '로그인 처리' });
    },
    SignUp: (req: Request, res: Response) => {
        console.log(req.body);
        res.json({ message: '회원가입 처리' });
    },
    CheckEmail: async (req: Request, res: Response) => {
        const { email } = req.query;
        console.log('Email :: ', email);

        if (!email) {
            return res.status(400).json({ 
                isAvailable: false, 
                message: '이메일을 입력해주세요.' 
            });
        }

        // 1. 해당 이메일이 존재하는지 SELECT 쿼리 실행
        const sql = 'SELECT id FROM users WHERE email = ?';
        const rows = await db.select<EmailCheckUserRow>(sql, [email]);

        // 2. 검색 결과가 없으면(rows.length === 0) 사용 가능
        if (rows.length === 0) {
            return res.status(200).json({
                isAvailable: true,
                message: '사용 가능한 이메일입니다.'
        });
        } else {
            return res.status(200).json({
                isAvailable: false,
                message: '이미 사용 중인 이메일입니다.'
            });
        }
    },
};

export { process, view };