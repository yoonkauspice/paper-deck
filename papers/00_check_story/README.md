# 00_check_story

**논문**: 템플릿 점검용: 노랑이 부품 시험 페이지

**덱 제목**: 노랑이 부품 시험

| 폴더 | 내용 |
|---|---|
| `final/` | **최종 결과물**: 아직 없음 |
| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |

다시 만들기(PC의 `input/00_check_story/` 에 원문이 있어야 함):

```bash
node src/build.js 00
node src/export_pptx.js 00
node src/final.js 00
```
