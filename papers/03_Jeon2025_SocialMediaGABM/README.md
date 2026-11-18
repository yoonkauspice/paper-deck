# 03_Jeon2025_SocialMediaGABM

**논문**: Jeon et al. (2025). Simulating conversations on social media with generative agent-based models. EPJ Data Science, 14:79

**덱 제목**: ABM과 LLM으로 만드는 소셜 미디어 대화 가이드

| 폴더 | 내용 |
|---|---|
| `final/` | **최종 결과물**: [03_Jeon2025_SocialMediaGABM.html](final/03_Jeon2025_SocialMediaGABM.html), [03_Jeon2025_SocialMediaGABM.pptx](final/03_Jeon2025_SocialMediaGABM.pptx) |
| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |

다시 만들기(PC의 `input/03_Jeon2025_SocialMediaGABM/` 에 원문이 있어야 함):

```bash
node src/build.js 03
node src/export_pptx.js 03
node src/final.js 03
```
