---
name: paper-deck
description: 논문 PDF를 읽고 발표자료를 만드는 파이프라인. 두 스타일 - 파랑이(16:9 슬라이드 덱, 기본)와 노랑이(스크롤형 레플리케이션 관찰일지). 둘 다 PPTX 내보내기, 수치 대조, PDF 그림 잘라내기 포함. "논문 발표자료 만들어줘", "파랑이로", "노랑이로", "이 논문 덱으로", "레플리케이션", "PPTX로", "숫자 확인", "paper-deck" 요청 시 사용. 아웃라인 합의 전에는 만들지 않는다.
---

# paper-deck

먼저 프로젝트 루트의 `CLAUDE.md`를 읽고 그 순서와 규칙을 따른다. 경로는 모두 프로젝트 루트 기준이다.

핵심 규칙 (자세한 내용은 CLAUDE.md):
1. `node src/new_paper.js <저자연도_주제> <PDF 경로>`로 다음 번호의 `papers/NN_저자연도_주제/`(`work/` 원고, `final/` 결과물)와 `input/`(원문)을 준비하고 `work/meta.json`의 alias·cite를 채운다(이미 있으면 건너뜀). 이후 `<키>`는 번호(04)나 alias(hou)로 줘도 된다. 표·그림은 `node src/pdf_figure.js <키> <쪽>`로 쪽 이미지를 만들어 직접 읽는다 → 정독 노트(원문 위치 포함) → 아웃라인.
2. 아웃라인(장 제목, 2줄 메시지, 표·그림·시뮬레이션 계획)을 사용자에게 보이고 승인받기 전에는 만들지 않는다.
3. 승인 후 수정은 오류만 즉시 고치고, 내용 변경은 장 번호별로 모아 한 번에 반영한다. 장수·순서 변경은 아웃라인부터 고친다.
4. 템플릿 CSS(`src/templates/`)는 수정하지 않는다. 스타일 변경이 필요하면 먼저 사용자와 합의한다.
5. 출력은 두 스타일이다. 파랑이 = 16:9 슬라이드 덱(`papers/<키>/work/slides/`, 기본, TOR 덱 디자인). 노랑이 = 스크롤형 레플리케이션 관찰일지(`papers/<키>/work/story/`, 고대비 흑백·파랑·노랑·Pretendard, `replication/run.js`로 실험하고 본문 숫자를 결과 파일에서 채움, 논문 그림은 `.sc-cmp`로 원본과 재현을 나란히). 사용자가 스타일을 말하지 않으면 파랑이.
6. 시뮬레이션은 `src/templates/sim.js`(PaperSim) 부품과 `papers/<키>/work/sims/*.js` 모형으로 만들고, node에서 헤드리스로 돌려 원문과 대조한다.
7. 빌드 `node src/build.js <키>` → 결과는 `output/<키>/`. 검증: 원문 감사(외부 모델 사용 가능) → 수치 대조 `node src/check_numbers.js <키>` → 렌더 검증.
8. ★ 최종 확인 후 PPTX: `node src/export_pptx.js <키>`(파랑이 `deck.pptx`, 노랑이 `story.pptx`, 화면 캡처 이미지 + 발표자 노트, 노트는 `work/script.md`). 끝나면 `node src/final.js <키>`로 `papers/<키>/final/`에 최종본을 두고 목록을 갱신한다.
9. Claude Code 웹(CLAUDE_CODE_REMOTE=true)에서는 CLAUDE.md의 웹 세션 절을 따른다: 원문은 공개 논문 URL만(공개 저장소라 PDF·개인정보 커밋 금지, 비공개는 private/), 아웃라인 전에 papers/<키> 커밋, 끝나면 node src/final.js <키> 후 커밋·push.
10. 문체는 "~합니다", 원문에 없는 내용은 쓰지 않고, 숫자는 원문과 대조한다. 원문 밖 자료(리뷰 등)는 `input/<키>/sources/`에 둔다. 원문·출력은 커밋하지 않는다.
