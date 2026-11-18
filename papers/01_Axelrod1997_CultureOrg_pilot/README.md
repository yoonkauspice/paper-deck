# 01_Axelrod1997_CultureOrg_pilot

**논문**: Axelrod (1997) 문화 확산 모형의 조직 확장, 5강 모형 코드를 새 덱 디자인으로 옮긴 시범본

**덱 제목**: 조직 안의 문화 확산 시뮬레이션

| 폴더 | 내용 |
|---|---|
| `final/` | **최종 결과물**: [01_Axelrod1997_CultureOrg_pilot.html](final/01_Axelrod1997_CultureOrg_pilot.html) |
| `work/` | 원고(고치는 곳): `meta.json`(제목·파일 이름), `slides/` 또는 `story/`(슬라이드 원고, 여러 조각을 이름 순서대로 이어 붙임), 노트, 아웃라인, `script.md`(발표 스크립트) |

다시 만들기(PC의 `input/01_Axelrod1997_CultureOrg_pilot/` 에 원문이 있어야 함):

```bash
node src/build.js 01
node src/export_pptx.js 01
node src/final.js 01
```
