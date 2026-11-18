# Claude Code 웹에서 쓰기 (GitHub 연결부터)

브라우저(claude.ai/code)만으로 이 파이프라인을 돌리는 방법입니다. 처음 한 번 하는 일(1~2부)과 논문마다 하는 일(3부)로 나눴습니다.

- 웹 세션은 GitHub 저장소를 클라우드 컴퓨터에 복제해서 작업합니다. 세션이 끝나면 그 컴퓨터는 사라지고, **커밋해서 GitHub에 올린 것만 남습니다.**
- 웹 세션에는 파일을 첨부할 수 없습니다. 이 저장소는 **공개**라 논문 PDF를 올리지 않고, 공개 논문의 URL(arXiv 등)을 줍니다. URL로 받을 수 없는 논문과 비공개 자료는 PC(WSL)에서 작업합니다.
- 결과물(HTML, PPTX)은 Claude가 `papers/<키>/final/`에 넣어 세션 브랜치에 올리고, GitHub에서 내려받습니다.

---

## 1부. 저장소를 GitHub에 올리기 (WSL 터미널, 한 번)

### 1-1. GitHub CLI 설치와 로그인
```bash
sudo apt-get install -y gh
gh auth login
```
질문에는 이렇게 답합니다.
1. `Where do you use GitHub?` → **GitHub.com**
2. `What is your preferred protocol for Git operations?` → **HTTPS**
3. `Authenticate Git with your GitHub credentials?` → **Yes**
4. `How would you like to authenticate?` → **Login with a web browser**
5. 화면에 나온 **8자리 코드**를 복사하고 Enter를 누릅니다. WSL에서는 브라우저가 자동으로 안 열릴 수 있으니, 윈도우 브라우저에서 **https://github.com/login/device** 를 직접 엽니다.
6. GitHub에 **구글 계정으로 로그인**(평소처럼 "Continue with Google") → 코드 붙여넣기 → **Authorize**.
7. 터미널에 `Logged in as yoonkauspice`가 나오면 끝입니다.

### 1-2. 저장소를 만들고 올리기
```bash
cd ~/projects/paper-deck
gh repo create paper-deck --private --source=. --remote=origin --push
```
- 저장소 만들기, 연결, 첫 push를 한 번에 합니다. 처음에는 비공개로 만들었고, 2026-11-18에 이름·학번을 기록에서 지운 뒤 **공개(Public)** 로 바꿨습니다.
- 비공개 논문과 제출판(이름·학번이 든 파일)은 별도 비공개 저장소 **paper-deck-private** 에 있습니다. PC에서는 `paper-deck/private/` 폴더가 그 저장소입니다(이 저장소에서는 git 제외).

### 1-3. (권장) main 보호
GitHub 저장소 → **Settings → Rules → Rulesets → New ruleset → New branch ruleset**
- Ruleset name: `main 보호`, Enforcement status: **Active**
- Target branches → **Add target → Include default branch**
- **Restrict deletions**, **Block force pushes** 체크 → **Create**

Claude는 작업을 세션 브랜치에 올리므로, 이렇게 해 두면 main이 실수로 망가지지 않습니다.

---

## 2부. Claude Code 웹 연결 (브라우저, 한 번)

### 2-1. 로그인과 GitHub 연결
1. **https://claude.ai/code** 접속 → Claude 계정으로 로그인(Pro/Max 등 유료 플랜 필요. 사용량은 계정 한도를 함께 씀)
2. 화면의 안내에 따라 **Connect GitHub** → GitHub 화면에서 **Authorize** → claude.ai/code로 돌아옵니다.

### 2-2. 저장소 접근 허용 (Claude GitHub App)
1. **https://github.com/apps/claude/installations/new** 접속
2. 설치할 계정으로 **yoonkauspice** 선택
3. **Only select repositories** → **paper-deck** 선택 → **Install**

### 2-3. 실행 환경 만들기
claude.ai/code에서 저장소를 고르는 곳 옆의 **환경(Environment) 선택 → 새 환경 추가(또는 기본 환경 편집)**
- 이름: `paper-deck`
- **Network access**: **Limited**, **Allow package managers** 체크(npm, Ubuntu 패키지용)
- **Allowed domains**(한 줄에 하나):
  ```
  cdn.jsdelivr.net
  arxiv.org
  export.arxiv.org
  ```
  - `cdn.jsdelivr.net`: 노랑이 글꼴(Pretendard). 없으면 노랑이 PPTX가 대체 글꼴로 찍힙니다.
  - `arxiv.org`: 공개 논문을 URL로 받을 때. 다른 학술지 사이트에서 받으려면 그 도메인도 추가합니다.
- **Setup script**(선택, 세션 시작이 빨라짐):
  ```bash
  apt-get update && apt-get install -y poppler-utils || true
  ```
  비워 둬도 저장소의 `src/scripts/web_session.sh`가 세션 시작 때 자동으로 설치합니다.
- 환경변수: 필요 없음

---

## 3부. 논문 작업 (매번)

### 3-1. 논문 원문
- **공개 논문 URL**: arXiv 같은 PDF 주소를 그대로 프롬프트에 넣습니다(환경의 허용 도메인에 그 사이트가 있어야 함).
- PDF 파일을 저장소에 올리지 않습니다. 공개 저장소라 누구나 내려받을 수 있게 됩니다. URL이 없는 논문은 PC(WSL)에서 작업합니다.

### 3-2. 세션 시작
claude.ai/code → 저장소 **paper-deck**, 브랜치 **main**, 환경 **paper-deck** → 프롬프트 예시:
```
https://arxiv.org/pdf/2310.05984 논문을 Tornberg2023_SocialMedia 로 노랑이 만들어줘. 핵심 모형을 시드 20개로 레플리케이션해줘.
```
진행은 로컬과 같습니다. 정독 노트와 아웃라인이 나오면 확인하고 승인하면 제작합니다. Claude가 아웃라인 단계에서 작업 원고를 한 번 커밋해 두므로, 세션이 끊겨도 이어서 할 수 있습니다.

### 3-3. 결과 받기
작업이 끝나면 Claude가 `papers/<키>/final/`(완성 HTML, PPTX)과 목록 `papers/README.md`를 커밋해 **세션 브랜치**에 올리고 브랜치 이름을 알려 줍니다.
1. GitHub 저장소 → 왼쪽 위 브랜치 선택(`main` 버튼) → 세션 브랜치 선택
2. `papers/<키>/final/` → 파일 클릭 → 오른쪽 위 **Download raw file**(⤓ 아이콘)
3. `.html`은 내려받아 브라우저로 열고, `.pptx`는 PowerPoint로 엽니다.

작업 원고를 main에 합치려면 claude.ai/code의 **Create PR** → GitHub에서 **Merge**. 결과물(`papers/<논문>/final/`)까지 main에 쌓이면 저장소가 커지니, 필요 없는 결과물은 PR에서 빼 달라고 하세요.

### 3-4. 로컬(WSL)로 이어 가기 (선택)
```bash
cd ~/projects/paper-deck && claude --teleport
```
웹 세션을 골라 로컬 터미널에서 이어서 작업합니다(같은 Claude 계정, 작업 폴더가 깨끗해야 함). 또는 `git fetch && git switch <세션 브랜치>`.

---

## 알아 둘 점
- 이 저장소는 **공개**입니다. 원문 PDF, 이름·학번 같은 개인정보, 기관 자료는 올리지 않습니다(비공개는 paper-deck-private).
- 세션마다 새 컴퓨터라, 다음 세션에서 같은 논문을 이어 하려면 URL이 다시 필요합니다. 작업 원고가 있으면 원문만 다시 준비하고 이어 갑니다.
- 아직 확인하지 못한 것: 웹 화면의 정확한 메뉴 이름(위 설명은 공식 문서 기준), 세션 브랜치 이름 규칙, 웹에서 결과 파일을 바로 내려받는 기능. 처음 한 번 해 보면서 다르면 이 문서를 고치면 됩니다.
