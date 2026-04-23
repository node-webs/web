import express from "express";
import { ck, mw } from "../lib/base";

import { view as view_web } from "./web.page";
import { view as view_auth, process as proc_auth } from "./auth.page";

const router = express.Router();

router.get("/", view_web.page);
router.get(encodeURI("/로그인"), mw.csrfSplitter, view_auth.SignIn);
router.get(encodeURI("/회원가입"), mw.csrfSplitter, view_auth.SignUp);
router.get("/:page", view_web.page4040);

router.post('/signin', proc_auth.SignIn);
router.post('/signup', proc_auth.SignUp);

export default router;