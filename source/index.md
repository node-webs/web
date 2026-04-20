## 1. Express

```
npm install express, -D @types/express
npm install -D ts-node typescript @types/node
```

const app: Express = express();
app.set("port", process.env.PORT || 3000);

app.listen(app.get('port'), () => {
    console.log(`http://localhost:${app.get('port')}`);
});

#### 데이터 파싱

form 데이터 처리 :  URL 인코딩된 데이터 처리
body-parser 설정 : request.body 객체 사용
app.use(express.json()); // JSON 형식의 데이터 처리
app.use(express.urlencoded({ extended: true })); // form 형식의 데이터 처리

// extended: true - qs 라이브러리를 사용하여 중첩된 객체와 배열을 지원
// URL을 통해 전달되는 데치터에 한글, 공백 등과 같은 문자가 포함될 경우 
// 제대로 인식되지 않은 문제 해결, 중복된 객체(복잡한 자료 값) 처리

# 2. nodemon
```
npm install -D nodemon
```
{
    "watch": ["source"],
    "ext": ".js,.ts",
    "env": {
        "NODE_ENV": "local"
    },
    "exec": "npx ts-node ./source/index.ts"
}

"scripts": {
    "dev": "npx nodemon",
    "start": "node build/index.js",
    "build": "rm -rf ./build/ && tsc -p .",
    "start:web": "cross-env NODE_ENV=production node build/index.js"
},

# 3. dotenv

```
npm install dotenv
```

- #### .env 파일 : development(.env.local), production(.env.web)
  
const envMode = process.env.NODE_ENV || 'web';
const envPath = path.join(process.cwd(), '/aset/data', `.env.${envMode}`);
dotenv.config({ path: envPath });

- #### nodemon 설정
  
  {
    "watch": ["source"],
    "ext": ".js,.ts",
    "env": {
  
        "NODE_ENV": "development"
  
    },
    "exec": "npx ts-node ./source/index.ts"
  }

- #### package.json 설정
  
  "start:web": "cross-env NODE_ENV=production node build/index.js"

# 4. nunjucks

npm install nunjucks, -D @types/nunjucks

app.engine('pet', nunjucks.render);
app.set("view engine", "pet");
const env = nunjucks.configure(path.join(__dirname, "../moda/templates"), {
    express: app,
    autoescape: true,
    watch: true,
});

[ autoescape: true (보안상 이유로 사용) ]

1. XSS(Cross-Site Scripting) 방어
   사용자로부터 입력받은 데이터에 포함된 위험한 문자(예: <, >, &, ", ')를 자동으로 HTML 엔티티로 변환(Escape)하여 브라우저가 이를 실행 가능한 스크립트로 인식하지 못하게 합니다.
2. 기본 동작: 넌적스는 기본적으로 autoescape: true가 설정되어 있어 보안에 안전한 상태로 작동합니다. 만약 이를 false로 설정하면 HTML 태그가 그대로 렌더링되어 공격자가 악성 스크립트를 삽입할 수 있는 위험이 생깁니다.

# 5. morgan

npm install winston winston-daily-rotate-file morgan, -D @types/morgan

import morgan, { StreamOptions } from 'morgan';

// 타입을 명시적으로 지정
const stream: StreamOptions = {
    // Morgan 스트림 설정
    // morgan이 생성한 로그 메시지를 winston의 info 레벨로 기록합니다.
    write: (message: string) => logger.info(message.trim()),
};

// 서비스 환경에 따른 morgan 포맷 설정
// production일 때는 자세한 combined 포맷, 그 외에는 dev 포맷 사용
const morganFormat: string = envMode === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
    stream,
    skip: (req, res) => res.statusCode < 400 // 성공 응답은 파일 기록 제외
}));

# 6. cookie-parser

쿠키 서명에 사용할 비밀 키, 서명된 쿠키 사용 시 필요
npm install --save cookie-parser, -D @types/cookie-parser

app.use(cookieParser(process.env.COOKIE_SECRET));

# session
개인 저장 공간 생성 (req.session 객체 사용)
npm install express-session, -D @types/express-session


npm install express-session, -D @types/express-session

app.use(session({
    // name: 'connect.sid',
    secret: process.env.COOKIE_SECRET || 'your-secret-key',
    resave: false, // 세션 수정 사항이 없으면 다시 저장하지 않음 (성능 향상)
    saveUninitialized: false, // 불필요한 빈 세션을 생성하지 않아 서버 메모리를 아끼고, CSRF 공격 방지에도 도움
    cookie: { 
        httpOnly: true, // 클라이언트 측 스크립트에서 쿠키 접근 방지
        sameSite: 'strict',
        // CSRF 방어용 쿠키와 동일하게 'strict' 권장 (더 강력한 보안)
        // 하지만 다른 사이트에서 링크를 타고 들어올 때 로그인이 유지되길 원한다면 'lax' 유지
        secure: false,   // HTTPS 사용 시 true로 변경
        // [수정] 실서비스(HTTPS) 환경을 위한 조건부 설정
        // secure: process.env.NODE_ENV === 'production', 
        maxAge: 1000 * 60 * 60   // 1시간 유지
    }
}));

# passport

npm install passport passport-local, -D @types/passport @types/passport-local
npm install passport-kakao passport-google-oauth20, -D @types/passport-kakao @types/passport-google-oauth20

[ Passport 설정 순서 ]
passportConfig() 로딩 -> 세션 설정 -> passport.initialize() -> passport.session()

passportConfig();
app.use(session({}));
app.use(passport.initialize());
app.use(passport.session());


# mysql

npm install mysql2

npm install --save express-validator
npm install --save bcrypt, --save-dev @types/bcrypt
npm install --save jsonwebtoken, --save-dev @types/jsonwebtoken