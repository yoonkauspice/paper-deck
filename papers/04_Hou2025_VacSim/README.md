# 04_Hou2025_VacSim

**논문**: Hou et al. (2025). Can A Society of Generative Agents Simulate Human Behavior and Inform Public Health Policy? A Case Study on Vaccine Hesitancy. COLM 2025

**덱 제목**: 생성형 에이전트 사회로 백신 정책을 실험할 수 있을까?

| 폴더 | 내용 |
|---|---|
| `final/` | **최종 결과물**: [ABM_Hou.html](final/ABM_Hou.html), [ABM_Hou.pptx](final/ABM_Hou.pptx) |
| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |

다시 만들기(PC의 `input/04_Hou2025_VacSim/` 에 원문이 있어야 함):

```bash
node src/build.js 04
node src/export_pptx.js 04
node src/final.js 04
```
