---
description: 논문 발표자료 빌드 (output/<키>/deck.html, story.html)
argument-hint: <키>
---

`node src/build.js $ARGUMENTS` 를 실행한다.
- 노랑이에 `papers/<키>/replication/run.js`가 있고 `output/<키>/results.json`이 없거나 모형이 바뀌었으면 먼저 실행한다.
- 이미지를 못 찾는다는 오류가 나면 `node src/pdf_figure.js <키> --all`로 논문 그림을 다시 만든 뒤 재시도한다.
- 끝나면 만들어진 파일 경로와 장·단계 수를 알린다.
