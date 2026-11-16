---
description: 발표자료의 숫자를 원문·자료·실험 결과와 대조
argument-hint: <키> [deck|story]
---

`node src/check_numbers.js $ARGUMENTS` 를 실행하고 `output/<키>/04_numbers.md`를 읽는다.
- 근거를 못 찾은 숫자마다 원문 쪽 이미지(`node src/pdf_figure.js <키> <쪽>`)로 확인한다.
- 틀린 숫자는 고칠 장과 함께 보고하고, 계산한 값이면 `papers/<키>/numbers_ok.txt`에 `값<TAB>이유`를 적자고 제안한다.
- 결과(전체 숫자 수, 확인 필요 수, 항목별 판단)를 사용자에게 보고한다.
