# paper-deck

논문(보고서) PDF를 읽고 발표자료를 만드는 파이프라인입니다. Claude Code가 규칙(`CLAUDE.md`)과 스킬(`.claude/skills/paper-deck`)을 따라 작업하고, 사람은 아웃라인과 최종본만 승인합니다.

- **파랑이**: 16:9 슬라이드 덱(HTML + PPTX). 발표용
- **노랑이**: 스크롤형 레플리케이션 관찰일지(HTML + PPTX). 모형을 다시 구현해 돌려 보는 용도

## 폴더

```
paper-deck/
├── CLAUDE.md            파이프라인 규칙(Claude가 읽음)
├── README.md            이 문서(새 PC 세팅)
├── .claude/             스킬(paper-deck)과 슬래시 명령(/new-paper, /build, /check, /export)
├── src/                 도구(Node.js)
├── templates/           파랑이·노랑이·시뮬레이션 템플릿
├── reference/, examples/  기준 덱과 마크업 예시
├── input/<키>/          논문 PDF와 원문에서 나온 것 (git 제외)
├── papers/<키>/         작업 원고: 노트, 아웃라인, 슬라이드, 스토리, 모형 코드 (git 포함)
├── output/<키>/         결과물: HTML, PPTX, 보고서 (git 제외)
├── package.json, package-lock.json
├── setup.sh             의존성 설치와 확인
└── .env.example         설정 이름(값은 비움)
```

논문 PDF와 결과물은 저장소에 들어가지 않습니다. 다른 PC에서는 PDF를 다시 넣고 빌드하면 같은 결과가 나옵니다(논문 그림은 `node src/pdf_figure.js <키> --all`로 다시 잘라냄).

## 새 PC 세팅

### A. Windows (WSL2 사용, 집·회사 PC 공통 추천)
1. **WSL2와 Ubuntu 설치**: 관리자 PowerShell에서 실행한 뒤 재부팅하고, Ubuntu를 처음 열어 사용자 이름과 비밀번호를 만듭니다.
   ```powershell
   wsl --install -d Ubuntu
   ```
2. **Chrome 설치(윈도우 쪽)**: PPTX 캡처에 씁니다. Edge만 있어도 됩니다.
3. **Ubuntu 터미널에서** 아래 "B. Ubuntu"를 그대로 진행합니다.
   - 저장소는 `/mnt/c/...`(윈도우 드라이브)가 아니라 `~/projects` 같은 Linux 쪽에 둡니다. 윈도우 드라이브에 두면 느리고 권한 문제가 생깁니다.
   - 윈도우 탐색기에서는 `\\wsl.localhost\Ubuntu\home\<사용자>\projects\paper-deck`로 열 수 있습니다.

### B. Ubuntu (또는 WSL2 안)
```bash
sudo apt-get update && sudo apt-get install -y git
git config --global user.name "yoonkauspice"
git config --global user.email "268092186+yoonkauspice@users.noreply.github.com"

mkdir -p ~/projects && cd ~/projects
git clone https://github.com/yoonkauspice/paper-deck.git
cd paper-deck
./setup.sh
```
`setup.sh`가 하는 일: nodejs·npm·poppler-utils가 없으면 apt로 설치(sudo 비밀번호를 물음), `npm ci`, `.env` 만들기, 크롬 찾기, `npm test`. 이미 있는 것은 건너뜁니다.

비공개 저장소를 clone할 때 비밀번호 대신 인증이 필요합니다. 가장 쉬운 방법은 GitHub CLI입니다.
```bash
sudo apt-get install -y gh && gh auth login
```

### C. Claude Code
Ubuntu(WSL) 안에 Claude Code를 설치하고 로그인한 뒤, 프로젝트 폴더에서 실행합니다. 설치 방법은 공식 문서(docs.anthropic.com의 Claude Code)를 따릅니다.
```bash
cd ~/projects/paper-deck && claude
```
프로젝트 안의 `.claude/`에 스킬과 명령이 있어 따로 복사할 필요가 없습니다.

### D. Claude Code 웹(브라우저)에서 쓰기
설치 없이 claude.ai/code에서 쓰려면 GitHub에 올린 뒤 연결합니다. GitHub 연결부터 웹 세션 사용, 결과 받기까지는 **`WEB_GUIDE.md`**에 단계별로 정리했습니다.

## 사용법
```bash
node src/new_paper.js schelling "C:\Users\me\Downloads\Schelling1971.pdf"   # 또는 Claude에게 경로만 알려 줌
```
그다음 Claude에게 "schelling 논문 파랑이로 만들어줘"(또는 노랑이로)라고 하면 정독 노트와 아웃라인부터 보여 주고, 승인 뒤 제작합니다.

| 명령 | 하는 일 |
|---|---|
| `npm run new -- <키> <PDF>` | 새 논문 폴더와 텍스트 추출 |
| `npm run figure -- <키> <쪽>` | 쪽 이미지(그림·표 확인용) |
| `npm run build -- <키>` | `output/<키>/deck.html`, `story.html` |
| `npm run check -- <키>` | 숫자를 원문과 대조 → `output/<키>/04_numbers.md` |
| `npm run export -- <키>` | PPTX(`output/<키>/deck.pptx`, `story.pptx`) |
| `npm run deliver -- <키>` | 최종본을 `deliver/<키>/`로 복사(웹 세션에서 받아 가기용) |
| `npm test` | 회귀 시험 |

Claude Code 안에서는 `/new-paper`, `/build`, `/check`, `/export`로도 부를 수 있습니다.

## 문제 해결
- **`npm test`가 `CMD.EXE`, `UNC 경로` 오류를 냄**: WSL에서 윈도우 쪽 npm이 잡힌 것입니다. `sudo apt-get install -y npm`으로 Linux npm을 설치하세요(`setup.sh`가 확인함).
- **Node.js가 오래된 경우**(Ubuntu 22.04 이하는 기본 nodejs가 낮음): NodeSource 또는 nvm으로 Node.js 20 이상을 설치한 뒤 `./setup.sh`를 다시 실행합니다.
- **PPTX 캡처 실패**: `.env`의 `CHROME=`에 크롬 경로를 적습니다. WSL은 윈도우 크롬을 부르므로 WSL 상호운용이 켜져 있어야 합니다(기본값).
- **회사망에서 글꼴이 다르게 보임**: 글꼴이 웹폰트(Google Fonts, jsDelivr)라 차단되면 대체 글꼴로 보입니다. 발표 PC에서 미리 열어 확인하세요.
- **회사망에서 `npm ci` 실패**: 프록시 설정이 필요할 수 있습니다(`npm config set proxy ...`).
