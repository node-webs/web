import { Request, Response } from 'express';

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
        res.json({ message: '로그인 처리' });
    },
    SignUp: (req: Request, res: Response) => {
        res.json({ message: '회원가입 처리' });
    }
};

export { process, view };