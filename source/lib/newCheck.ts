import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 1. 공통 에러 처리 미들웨어 (내부용)
const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ 
    success: false, 
    errors: errors.array() 
  });
};

// 2. 로그인 유효성 검사
export const signinValidator = [
  body('email').isEmail().withMessage('이메일 형식을 확인해주세요.'),
  body('password').notEmpty().isLength({ min: 6, max: 20 }).withMessage('비밀번호는 6~20자 사이여야 합니다.'),
  validate
];

// 3. 회원가입 유효성 검사
export const signupValidator = [
  body('email')
    .isEmail().withMessage('유효한 이메일 형식이 아닙니다.')
    .isLength({ max: 100 }).withMessage('이메일은 100자 이내여야 합니다.'),
  body('password')
    .isLength({ min: 6, max: 20 }).withMessage('비밀번호는 6자 이상 20자 이하여야 합니다.')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('특수문자를 하나 이상 포함해야 합니다.'),
  body('type')
    .optional({ nullable: true })
    .isArray().withMessage('타입은 배열 형태여야 합니다.')
    .custom((value: any[]) => {
      const allowed = ['cat', 'dog', null];
      const isInvalid = value.some(item => !allowed.includes(item));
      if (isInvalid) {
        throw new Error('올바른 반려동물 타입을 선택해주세요 (cat, dog, null).');
      }
      return true;
    }),
  validate
];

// 4. 이메일 중복 체크 유효성 검사
export const checkEmailValidator = [
  body('email').isEmail().withMessage('유효한 이메일 주소를 입력해주세요.'),
  validate
];

// 5. 반려동물 등록 유효성 검사
export const petRegistrationValidator = [
  body('name').notEmpty().withMessage('이름을 입력해주세요.').isLength({ max: 50 }),
  body('type').isIn(['dog', 'cat']).withMessage('올바른 타입을 선택해주세요 (dog, cat).'),
  body('breed').optional().isLength({ max: 50 }),
  validate
];
