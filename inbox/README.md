# inbox: Claude Code 웹으로 보낼 논문 PDF

웹 세션에는 파일을 첨부할 수 없어서, PDF는 이 폴더를 거쳐 보낸다.

1. GitHub 웹에서 이 저장소를 열고 `inbox` 폴더로 들어가 **Add file → Upload files**로 PDF를 올린 뒤 **Commit changes**(main에 바로)
2. claude.ai/code에서 "inbox/파일이름.pdf 를 schelling 으로 파랑이 만들어줘"

- 이 저장소는 반드시 **Private**으로 둔다. 올린 PDF는 git 기록에 남는다(나중에 지워도 기록에는 남음).
- 공개 논문(arXiv 등)은 PDF를 올리지 말고 URL을 주면 된다(환경의 허용 도메인에 그 사이트 추가 필요).
- 비공개·기관 자료는 올리지 말고 로컬(WSL)에서 작업한다.
