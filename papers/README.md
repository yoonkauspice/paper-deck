# 논문 목록

논문 하나 = 폴더 하나입니다. 폴더 이름은 `번호_저자연도_주제`입니다.

- **결과물은 각 폴더의 `final/`** 에 있습니다(완성 HTML, PPTX). 받아 갈 파일은 여기만 보면 됩니다.
- `work/` 는 원고입니다(슬라이드 원고, 노트, 아웃라인, 발표 스크립트). 고칠 때는 여기를 고치고 다시 빌드합니다.
- 원문 PDF와 빌드 중간 파일은 PC의 `input/`, `output/` 에만 있고 GitHub에는 올리지 않습니다.

| 번호 | 폴더 | 논문 | 형식 | 최종 파일 |
|---|---|---|---|---|
| 01 | [01_Axelrod1997_CultureOrg_pilot](01_Axelrod1997_CultureOrg_pilot/) | Axelrod (1997) 문화 확산 모형의 조직 확장, 5강 모형 코드를 새 덱 디자인으로 옮긴 시범본 | 파랑이(슬라이드) | [01_Axelrod1997_CultureOrg_pilot.html](01_Axelrod1997_CultureOrg_pilot/final/01_Axelrod1997_CultureOrg_pilot.html) |
| 02 | [02_Axelrod1997_Culture_story](02_Axelrod1997_Culture_story/) | Axelrod, R. (1997). The Dissemination of Culture: A Model with Local Convergence and Global Polarization. Journal of Conflict Resolution, 41(2), 203–226 | 노랑이(스크롤) | [02_Axelrod1997_Culture_story.html](02_Axelrod1997_Culture_story/final/02_Axelrod1997_Culture_story.html)<br>[02_Axelrod1997_Culture_story.pptx](02_Axelrod1997_Culture_story/final/02_Axelrod1997_Culture_story.pptx) |
| 03 | [03_Jeon2025_SocialMediaGABM](03_Jeon2025_SocialMediaGABM/) | Jeon et al. (2025). Simulating conversations on social media with generative agent-based models. EPJ Data Science, 14:79 | 파랑이(슬라이드) | [03_Jeon2025_SocialMediaGABM.html](03_Jeon2025_SocialMediaGABM/final/03_Jeon2025_SocialMediaGABM.html)<br>[03_Jeon2025_SocialMediaGABM.pptx](03_Jeon2025_SocialMediaGABM/final/03_Jeon2025_SocialMediaGABM.pptx) |
| 04 | [04_Hou2025_VacSim](04_Hou2025_VacSim/) | Hou et al. (2025). Can A Society of Generative Agents Simulate Human Behavior and Inform Public Health Policy? A Case Study on Vaccine Hesitancy. COLM 2025 | 파랑이(슬라이드) | [ABM_Hou.html](04_Hou2025_VacSim/final/ABM_Hou.html)<br>[ABM_Hou.pptx](04_Hou2025_VacSim/final/ABM_Hou.pptx) |

## 점검용(논문 아님)

템플릿이 깨지지 않았는지 확인하는 시험 폴더입니다. `npm test` 가 사용합니다.

| 번호 | 폴더 | 내용 | 형식 | 최종 파일 |
|---|---|---|---|---|
| 00 | [00_check_deck](00_check_deck/) | 템플릿 점검용: TOR 기준 덱(Törnberg et al., 2023)을 파랑이 템플릿으로 다시 조립 | 파랑이(슬라이드) | 아직 없음 |
| 00 | [00_check_story](00_check_story/) | 템플릿 점검용: 노랑이 부품 시험 페이지 | 노랑이(스크롤) | 아직 없음 |

이 파일은 `node src/final.js` 가 자동으로 만듭니다. 직접 고치지 마세요.
