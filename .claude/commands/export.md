---
description: 발표자료를 PPTX로 내보내기 (파랑이 deck.pptx, 노랑이 story.pptx)
argument-hint: <키> [deck|story]
---

`node src/export_pptx.js $ARGUMENTS` 를 실행한다(먼저 빌드가 되어 있어야 함).
- 끝나면 `output/<키>/`의 PPTX 경로, 장 수, 발표자 노트에 빈 숫자가 없는지 확인한 결과를 알린다.
- 슬라이드는 화면 캡처 이미지라 PowerPoint에서 글자를 고칠 수 없다는 점을 함께 알린다.
- 크롬을 못 찾으면 `.env`의 `CHROME=`에 경로를 적도록 안내한다.
