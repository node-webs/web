import express, { urlencoded } from "express";

import { view as view_web } from "./web.page";
// import { view as view_auth, process as proc_auth } from "./auth.page";

const router = express.Router();

router.get("/", view_web.index);
// router.get(encodeURI("/로그인"), view_auth.SignIn);
// router.get(encodeURI("/회원가입"), view_auth.SignUp);
// router.post('/signin', proc_auth.SignIn);
// router.post('/signup', proc_auth.SignUp);

export default router;