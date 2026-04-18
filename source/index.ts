// npm install express
// npm install -D @types/express typescript ts-node @types/node nodemon

import express, { Express, Request, Response } from 'express';

const app: Express = express();
app.set('port', process.env.PORT || 3000);

app.get('/', (req: Request, res: Response) => {
    res.send("Welcome Page ..............");
})

app.listen(app.get('port'), () => {
    // npx ts-node ./source/index.ts
    // taskkill /f /im node.exe

    // search
    // tasklist | findstr node
    // 포트로 찾기 : netstat -ano | findstr :3000
    // PID 강제 종료 : taskkill /f /pid 찾은숫자
    console.log(`Server is running on port http://localhost:${app.get('port')}`);
});