# paper-deck: 논문 → 발표자료(HTML + PPTX) 파이프라인

논문(보고서) PDF를 읽고 정독 노트 → 아웃라인(사용자 승인) → 발표자료 → 검증 → PPTX 순서로 만든다.
모든 경로는 이 파일이 있는 **프로젝트 루트** 기준이다. 새 PC 세팅은 `README.md`.

출력은 두 가지이고 디자인이 서로 다르다. 사용자가 이름으로 고른다. 말이 없으면 파랑이.
- **파랑이** = 슬라이드 덱(`papers/<키>/work/slides/` → `output/<키>/deck.html`): 기준 덱 `src/reference/TOR_기준덱.html`의 글씨·색·폰트·레이아웃을 그대로 유지한다(남색·파랑, Noto Sans KR, 16:9). 발표용
- **노랑이** = 스크롤형 관찰일지(`papers/<키>/work/story/` → `output/<키>/story.html`, `story.pptx`): 고대비 흑백 + 파랑(#0046C8)·노랑(#FFE000) 강조, Pretendard 굵은 글꼴, 검정 굵은 선과 둥근 모서리(`src/templates/story.css`). 레플리케이션과 따라 읽기용. 파랑이 디자인을 섞지 않는다
- "둘 다"면 노트·아웃라인·감사는 한 번만 하고 출력만 두 개 만든다

## 폴더 (논문 하나 = 폴더 하나, 원고와 결과물을 나눈다)
| 폴더 | 내용 | git |
|---|---|---|
| `papers/<키>/work/` | 원고: `meta.json`(alias, cite, title, file 등), `02_notes.md`, `03_outline.md`, `04_audit.md`, `slides/`(여러 조각을 이름 순서대로 이어 붙임), `story/`, `sims/`, `replication/run.js`, `extra.js`, `script.md`(발표 스크립트), `assets/`, `figures.txt`, `numbers_ok.txt` | 커밋 |
| `papers/<키>/final/` | **최종 결과물**: 완성 HTML, PPTX(`node src/final.js <키>`) | 커밋(GitHub에서 받는 곳) |
| `papers/<키>/README.md`, `papers/README.md` | 논문별 안내와 전체 목록(`final.js`가 자동 생성, 직접 고치지 않음) | 커밋 |
| `input/<키>/` | `source.pdf`, `extract/`(full.txt, pages/p<쪽>.png), `figures/`(논문 그림 자른 것), `sources/`(리뷰 등 원문 밖 자료) | **커밋 안 함**(PC 전용, 저작권·비공개) |
| `output/<키>/` | 빌드 중간 결과: `deck.html`, `story.html`, `*.pptx`, `export/`, `04_numbers.md`, `results.json` | 커밋 안 함(PC 전용, 다시 만들 수 있음) |
| `src/` | 도구(아래). 공통 경로 규칙은 `src/paths.js` | 커밋 |
| `src/templates/` | 파랑이 `head.html`·`tail.html`(TOR 덱에서 떼어냄, **수정 금지**), 노랑이 `story.css`·`scroll.js`, 시뮬레이션 `sim.css`·`sim.js` | 커밋 |
| `src/reference/`, `src/examples/` | 기준 덱, 슬라이드 유형별 마크업 예시(표지, 구분 `dv`, 본문 `.body`, `.body.full`, 표, 감사 `.au3`, 단계 위젯 `mkStep`) | 커밋 |
| `src/scripts/web_session.sh` | 웹 세션 시작 때 자동 준비 | 커밋 |
| `docs/WEB_GUIDE.md` | Claude Code 웹 사용 안내 | 커밋 |
| `private/` | **비공개 저장소 paper-deck-private**(별도 git, 이 저장소에서는 제외): `papers/NN_*/`(비공개 논문, 공개 전 작업 중인 논문), `README.md`(자동 생성), (선택) `overlays/`·`submissions/`(제출판) | 별도 비공개 저장소에 커밋 |
| `.claude/skills/paper-deck/`, `.claude/commands/` | 스킬과 슬래시 명령(`/new-paper`, `/build`, `/check`, `/export`) | 커밋 |

**논문 폴더 이름**: `번호_저자연도_주제`(예: `04_Hou2025_VacSim`). 번호는 작업 순서. `00_check_*`는 회귀 시험(파랑이 템플릿 재조립, 노랑이 부품), **공개 여부는 위치로 정한다**: `papers/`는 공개, `private/papers/`는 비공개(예: `private/papers/01_주제`). 번호는 저장소마다 따로 매긴다. 도구는 두 곳을 함께 찾고, 번호가 겹치면(예: 공개 `01`과 비공개 `01`) alias나 폴더 이름으로 지정한다. 새 비공개 논문은 `node src/new_paper.js <저자연도_주제> <PDF> --private`.

**공개 저장소다.** 이 저장소(paper-deck)는 Public이다. 원문 PDF, 이름·학번 같은 개인정보, 기관 자료, 미공개 리뷰는 절대 이 저장소에 커밋하지 않는다. 그런 것은 `input/`(PC 전용) 또는 `private/`(비공개 저장소)에 둔다. 커밋 전에 `git diff --cached`로 개인정보가 없는지 확인한다.

**제출판(선택)**: 공개판과 내용이 같고 표지 등 일부만 다른 판(예: 이름·학번이 든 과제 제출용). 바꿀 문구와 파일 이름은 `private/overlays/<키>.json`의 `{"file":"이름","replace":[["공개판 문구","제출판 문구"]]}`. 만들기: `node src/build.js <키> --submit` → `node src/export_pptx.js <키> --submit` → `node src/final.js <키> --submit`(결과는 `private/submissions/<키>/`)
**<키>**: 도구에는 폴더 이름 전체, 번호(`04`), `meta.json`의 `alias`(`hou`), 폴더 이름의 한 마디(`vacsim`) 가운데 무엇을 줘도 된다. 여러 개가 맞으면 번호로 지정하라는 오류가 난다.

## 도구 (모두 `<키>` 하나만 받는다. `npm run <이름> -- <키>`도 같음)
- `node src/new_paper.js <저자연도_주제> <PDF 경로>`: 다음 번호를 붙여 `papers/NN_저자연도_주제/`(work, final)와 `input/`, `output/`을 만들고 PDF 복사 + 텍스트 추출(윈도우 경로 가능). `meta.json`의 `alias`(짧은 이름)와 `cite`(서지)를 채운다. 이미 있는 논문이면 원문만 다시 준비
- `node src/pdf_figure.js <키> <쪽>`: 쪽 이미지 `input/<키>/extract/pages/p<쪽>.png`를 만들어 읽는다. 텍스트로 안 나오는 표·그림 수치는 반드시 이미지로 확인
- `node src/pdf_figure.js <키> <쪽> <이름> --crop x0,y0,x1,y1 [--dpi 200]`: 그림만 잘라 `input/<키>/figures/<이름>.png`(쪽 대비 0~1 비율). 기록이 `papers/<키>/work/figures.txt`에 남고, 다른 PC에서는 `node src/pdf_figure.js <키> --all`로 다시 만든다. HTML에서는 `{{IMG:<이름>.png}}`
- `node src/build.js <키>`: `output/<키>/deck.html`·`story.html`. `{{IMG:}}`는 `work/assets` → `input/<키>/figures` 순서, `{{JSON:}}`은 `work/` → `output/<키>` 순서로 찾는다
- `node src/check_numbers.js <키> [deck|story]`: 쓴 숫자를 원문(`input/<키>/extract/full.txt`), 추가 자료(`input/<키>/sources/`), 실험 결과(`output/<키>/results.json`)와 대조 → `output/<키>/04_numbers.md`. 계산한 값은 `work/numbers_ok.txt`에 `값<TAB>이유`
- `node src/export_pptx.js <키> [deck|story]`: 파랑이 `deck.pptx`(1920×1080), 노랑이 `story.pptx`(1600×900). 슬라이드는 화면 캡처 이미지, 노트는 글(편집 불가 이미지라는 점을 사용자에게 알림). 파랑이 노트는 `work/script.md`의 `## 번호` 절(발표 스크립트, 없으면 제목+메시지). `meta.json`에 `"file":"이름"`이 있으면 `이름.pptx`로 저장. 크롬 경로는 `.env`의 `CHROME`(없으면 자동 탐색)
- `node src/final.js <키>`: `output/<키>/`의 완성 HTML·PPTX를 `papers/<키>/final/`로 복사(이름은 `meta.json`의 `file`, 없으면 폴더 이름)하고 `papers/README.md`와 폴더별 `README.md`를 다시 만든다. `--index`는 안내문만
- `npm test`: 회귀 시험(시험용·예시 논문 빌드, 템플릿 문법 확인)

## 작업 순서 (사용자 승인 지점: ★)
1. 시작: `node src/new_paper.js <키> <PDF>`(이미 있으면 건너뜀). 표·그림·부록은 쪽 이미지로 확인하고 절 번호와 함께 정리
2. 정독 노트 `papers/<키>/work/02_notes.md`: 연구 질문, 방법, 데이터, 수식, 결과 수치, 저자 한계. 모든 항목에 원문 위치(§, 표)
3. ★ 아웃라인 `papers/<키>/work/03_outline.md`: 파랑이는 5개 파트(왜/방법/설계/결과/해석), 장마다 2줄 메시지. 노랑이는 장과 단계, 그래픽, 실험 계획. 합의 전에는 만들지 않는다
4. 작성: 파랑이는 템플릿 클래스만 사용(새 CSS 금지), 그림은 SVG로 다시 그린다. 노랑이는 아래 노랑이 절
5. 원문 감사 `papers/<키>/work/04_audit.md`: 별도 에이전트와 외부 모델(Gemini 등)이 원문과 대조(수치, 수식, 설계 기록, 한계). 결과를 감사 장에 반영
6. 수치 대조: `node src/check_numbers.js <키>`. 근거를 못 찾은 숫자는 원문 쪽 이미지로 확인해 고치거나, 계산값이면 `numbers_ok.txt`에 이유. 결과를 사용자에게 보고
7. 렌더 검증: 텍스트 넘침, 줄바꿈, 깨진 글자, 콘솔 오류(노랑이는 `?shot=번호` 캡처, 파랑이는 `export_pptx.js`가 만든 `output/<키>/export/d*.png`로도 확인)
8. ★ 최종 확인 후 PPTX: `node src/export_pptx.js <키>`. 글자를 고칠 수 있는 PPTX가 따로 필요하면 그때 `anthropic-skills:pptx` 스킬로 만든다
9. 최종본 정리: `node src/final.js <키>` → `papers/<키>/final/`과 목록 갱신. 사용자가 요청하면 커밋

## 시뮬레이션 장 (선택)
- 부품: `src/templates/sim.css`, `src/templates/sim.js`(PaperSim). 슬라이드에 `<div class="sim" data-sim="모형이름" data-seed="7"></div>`를 넣으면 빌드가 자동으로 붙임. 없으면 결과가 바이트 단위로 같음
- 모형: `papers/<키>/work/sims/*.js`에서 `PaperSim.register(이름, {params, presets, views, legend, metrics, init, step, measure, draw})`. 버튼(시작, 한 단계, 끝까지, 초기화, 새 시드, 속도), 슬라이더, 지표 칸, 실시간 차트는 부품이 만듦
- 동작: 장에 들어오면 같은 시드로 초기화, 장을 넘기면 멈춤. 시드가 같으면 결과가 같음
- 아웃라인에 시뮬레이션 장을 명시: 모형, 조절할 파라미터, 보여 줄 지표, 청중이 봐야 할 장면
- 구현 검증: node에서 모형을 헤드리스로 돌려 시나리오별 결과를 원문(또는 원본 코드)과 대조하고 `04_audit.md`에 남김
- 측정 간격: 페이지의 "끝까지"와 실험 코드는 같은 측정 간격(`ffMeasure`)을 써야 같은 시드에서 같은 숫자가 나옴
- 예시: `papers/01_Axelrod1997_CultureOrg_pilot/`

## 노랑이: 스크롤형 출력 (레플리케이션 관찰일지 형식)
- 디자인은 파랑이와 별개인 전용 테마 `src/templates/story.css`(색은 CSS 변수 `--ink --accent --yellow --pale`, 차트·시뮬레이션은 `--c-*`, `--sim-*` 변수에서 읽음). 아이콘만 파랑이 템플릿에서 가져옴. 엔진: `src/templates/scroll.js`(ScrollStory)
- 테마 부품: 왼쪽 세로 타임라인과 동그라미 단계 표시, 노란 `관찰 메모` 카드(`.sc-memo`), 흰 테두리 대화 카드(`<div class="sc-say" data-who="질문">`), 노란 알약 라벨(`.sc-pill`), 숫자 강조(`.v`). 표지 오른쪽은 모형을 단순한 도형으로 그린 그림(`.art`). 캐릭터 이미지는 쓰지 않음(필요하면 사용자가 파일 제공)
- 파일: `papers/<키>/work/story/NN_*.html`(표지 `.sc-hero`, 장 `.sc-ch`), `story/*.js`(그래픽 핸들러). `slides/`와 같이 있으면 둘 다 빌드
- 구조: 왼쪽 글 단계(`.sc-step[data-g][data-s]`), 오른쪽 고정 그래픽(`.sc-g#id`). 단계가 화면 가운데 오면 `ScrollStory.on(id, fn(단계, 그래픽))` 실행. 그래픽 안의 `.sim`은 `root._sim.preset/set/view/ff`로 단계에 맞춰 제어
- 장 안의 단계 형식: 제목 한 문장, 한 문단에 한 요점, 필요하면 `바꾼 것/맞춰 둔 것/확인한 것`(`.sc-tri`), `관찰 메모`(`.sc-memo`)
- 차트: `ScrollStory.dots`(시드별 점과 평균), `lines`, `hbars`. 색은 `ScrollStory.color`
- 논문 그림 나란히 비교(레플리케이션의 핵심 장): `<div class="sc-cmp">`(넓은 그림은 `sc-cmp stack`) 안에 `<figure>`(논문 원본, `src/pdf_figure.js`로 자른 이미지)와 `<figure class="re">`(재현 차트 `.sc-gb`), 단계 글에 `<dl class="sc-diff"><dt>같은 점</dt>…<dt class="diff">다른 점</dt>…</dl>`. 다른 점은 숨기지 않고 이유를 적는다
- 숫자는 손으로 쓰지 않는다: `<span data-v="경로" data-f="형식">`로 실험 결과에서 채움(`story.js`에서 `{{JSON:results.json}}`). 다시 돌리면 본문 숫자도 바뀜
- 레플리케이션: `papers/<키>/work/replication/run.js`가 페이지와 같은 모형 파일을 헤드리스로 실행해 `output/<키>/results.json`(시드, 규칙, 실행 환경 포함)을 만든다. 빌드 전에 실행. 시드 1개 결과로 결론 내지 않는다. 처음 결과가 틀렸으면 그 과정도 본문에 남긴다
- 마지막 장에 한계, 재현 방법, 실행 환경, 제작 기록(사용 모델 포함)을 둔다
- 확인: 주소에 `?step=번호`는 그 단계로 이동, `?shot=번호`는 그 단계 글과 그래픽만 한 화면(헤드리스 캡처용)
- 발표: ↓ → 스페이스 = 다음 단계, ↑ ← = 이전 단계, 상단 `전체 화면`. PPTX를 만든 뒤 다시 빌드하면 상단에 `PPTX 받기` 버튼이 붙음
- 노랑이 PPTX 확인: 슬라이드 수 = 단계 수 + 1, 노트에 빈 숫자가 없는지 확인
- 예시: `papers/02_Axelrod1997_Culture_story/`

## 용도별 판 (파랑이, 선택 장)
같은 덱을 논문 발표·랩미팅·연구계획서 등 용도에 따라 장을 골라 만든다(비공개 저장소의 작업 중 논문에서 주로 씀)
- 선택 장 표시: `<section class="slide " data-id="limits" data-opt="limits">`. 여러 용도에 들어가면 `data-opt="review revise plan"`처럼 공백으로. 구분 장(dv)에 `data-opt`를 주면 그 부 전체가 선택
- 표지·구분 장 목록의 `<li data-opt="...">`도 같이 빠진다. 장 번호는 자리표시로 쓴다: `{{N:id}}`(data-id가 id인 장의 번호), `{{R:id}}`(data-id가 id인 구분 장이 묶는 범위), `{{PARTS}}`(부의 수). 진행바의 부 이름(meta.parts)도 빠진 부를 자동으로 뺀다
- `meta.json`: `"variants": {"talk": {"label": "논문 발표", "opts": ["limits"]}, "lab": {...}, "proposal": {...}}`
- 권장 선택 장 이름: `limits`(현재 한계), `review`(심사·피드백), `revise`(수정 방향), `plan`(향후 계획). 다음 단계 장은 원문·심사평·저자 계획에 있는 내용만 쓰고, 결과가 없는 계획은 "계획, 결과 없음"으로 표시한다
- 만들기: `node src/build.js <키> --variant <용도>` → `output/<키>/<용도>/deck.html`, `node src/export_pptx.js <키> --variant <용도>` → `<파일 이름>_<용도>.pptx`, `node src/final.js <키>`가 전체판과 용도별 판을 모두 `final/`에 복사. `--variant` 없이 빌드하면 선택 장을 모두 넣은 전체판
- 발표 스크립트(`script.md`)는 `## 09`(전체판 장 번호) 또는 `## limits`(data-id)로 쓴다. 용도별 판은 data-id로 찾는다

## 합의 규칙 (불필요한 반복 수정 방지)
- 아웃라인(장 제목 + 2줄 메시지 + 들어갈 표·그림) 승인 전에는 만들지 않는다
- 승인 후 수정: 원문과 어긋난 오류는 즉시 수정, 내용 변경 요청은 장 번호별로 모아 한 번에 반영
- 장수, 순서, 내용 변경은 `03_outline.md`를 먼저 고쳐 합의한 뒤 반영
- 수정할 때마다 전체를 다시 만들지 않고 해당 파일만 고쳐 빌드

## 문체·규칙
- "~합니다" 체, 장당 메시지 2줄, 출처는 장마다 `출처: 저자 (연도) §, 표`
- 원문에 없는 내용은 쓰지 않는다. 해석이나 추론은 "원문 감사" 장에 분리해서 표시
- 숫자는 원문과 대조 후 기입

## Claude Code 웹(클라우드) 세션
환경변수 `CLAUDE_CODE_REMOTE=true`면 웹 세션이다. 세션 시작 때 `src/scripts/web_session.sh`가 poppler 설치, `npm ci`, `.env`를 자동으로 준비한다(`.claude/settings.json`).
- 웹 세션은 매번 새 컴퓨터다. `input/`, `output/`은 세션이 끝나면 사라지고, 커밋해서 push한 것만 남는다
- **원문 가져오기**: 공개 논문 URL로만 받는다: `node src/new_paper.js <키> <URL>`(공개 저장소라 PDF를 커밋하지 않음). 작업 원고(`papers/<키>`)가 이미 있으면 원문만 다시 준비된다(이어 하기). 그림은 `node src/pdf_figure.js <키> --all`
- **중간 저장**: 아웃라인을 보여 주고 승인을 기다리기 전에 `papers/<키>/work/`를 커밋하고 push한다(세션이 끊겨도 이어서 할 수 있게)
- **결과물 내보내기**: 빌드(필요하면 PPTX)까지 끝나면 `node src/final.js <키>`로 `papers/<키>/final/`에 복사하고 `papers/<키>/`와 `papers/README.md`를 커밋해 push한다. 사용자는 GitHub에서 이 브랜치의 `papers/<키>/final/` 파일을 내려받는다. push한 브랜치 이름을 마지막에 알려 준다
- `input/`은 커밋 대상이 아니다. 원문 PDF·텍스트를 다른 곳에 커밋하지 않는다(결과물 속 논문 그림은 출처를 밝혀 둠)
- 크롬은 클라우드의 `CHROME_PATH`를 자동으로 쓴다. 노랑이 캡처는 Pretendard 글꼴 서버(`cdn.jsdelivr.net`)가 막혀 있으면 대체 글꼴로 찍히므로, 그런 경고가 보이면 사용자에게 환경의 허용 도메인 추가를 안내한다
- main에 직접 push하지 않는다(세션 브랜치에 push)

## 환경과 주의사항
- 필요한 것: Node.js 20 이상, npm, poppler-utils(`pdftotext`, `pdfinfo`, `pdftoppm`), 크롬(PPTX 캡처). `./setup.sh`가 확인하고 설치한다
- 비밀값은 없다. 설정은 `.env`(`.env.example` 복사)에만 두고 커밋하지 않는다
- WSL에서는 윈도우 크롬을 쓴다(상호운용 필요). 임시 로컬 서버 포트가 윈도우에 보이기까지 시간이 걸려 대기와 재시도가 들어 있다
- 글꼴은 웹폰트(Google Fonts, jsDelivr)라 인터넷이 막히면 대체 글꼴로 보인다
