echo "# web" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/node-webs/web.git
git push -u origin main


git ac 'commit'

warning: in the working copy of 'package-lock.json', LF will be replaced by CRLF the next time Git touches it
git config --global core.autocrlf true

업로드 상태에서 파일 삭제
git rm --cached .env
git commit -m "Remove .env from repository"
git push origin main

브런치 만들기
생성 : git checkout -b 브랜치이름

브런치 변경 : git fetch origin -> git switch 브랜치 이름
변경 : git checkout 브랜치이름
git push origin 브랜치이름