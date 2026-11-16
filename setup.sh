#!/usr/bin/env bash
# 새 PC 세팅: ./setup.sh   (Ubuntu 또는 Windows의 WSL2 Ubuntu)
#  - 필요한 시스템 패키지(nodejs, npm, poppler-utils)를 확인하고 없을 때만 apt로 설치(sudo 비밀번호 필요)
#  - npm 패키지를 lockfile 그대로 설치(npm ci)
#  - .env 가 없으면 .env.example 에서 만듦
#  - PPTX 캡처용 크롬을 찾아 알려 줌
#  - 마지막에 npm test(회귀 시험)
# 이미 설치된 것은 건너뛴다. apt 설치를 건너뛰려면: SKIP_APT=1 ./setup.sh
set -euo pipefail
cd "$(dirname "$0")"
SKIP_APT="${SKIP_APT:-0}"
have(){ command -v "$1" >/dev/null 2>&1; }
# WSL에서는 윈도우 쪽 npm(/mnt/c/...)이 잡힐 수 있어 Linux npm이 따로 있는지 본다
linux_npm(){ local p; p="$(command -v npm 2>/dev/null || true)"; [ -n "$p" ] && [[ "$p" != /mnt/* ]]; }
node_major(){ node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo 0; }

echo "== 1. 시스템 패키지"
need=()
if ! have node || [ "$(node_major)" -lt 20 ]; then need+=(nodejs); fi
linux_npm || need+=(npm)
{ have pdftotext && have pdfinfo && have pdftoppm; } || need+=(poppler-utils)
if [ ${#need[@]} -eq 0 ]; then echo "모두 있음: node $(node -v), npm $(npm -v), $(pdftotext -v 2>&1 | head -1)"
elif [ "$SKIP_APT" = "1" ]; then echo "건너뜀(SKIP_APT=1). 필요하면 직접: sudo apt-get install -y ${need[*]}"; [[ " ${need[*]} " == *" npm "* ]] && echo "주의: Linux npm이 없어 윈도우 npm을 씁니다. npm run 명령은 WSL 경로에서 실패하므로 node src/... 로 직접 실행하세요."
elif have apt-get; then echo "설치: ${need[*]}"; sudo apt-get update && sudo apt-get install -y "${need[@]}"
else echo "apt-get이 없습니다. 직접 설치하세요: ${need[*]}"; exit 1; fi
if [ "$(node_major)" -lt 20 ]; then
  echo "Node.js 20 이상이 필요합니다(지금: $(node -v 2>/dev/null || echo 없음)). README의 'Node.js가 오래된 경우'를 보세요."; exit 1; fi

echo "== 2. npm 패키지"
if [ -d node_modules/pptxgenjs ]; then echo "이미 설치됨(node_modules). 다시 설치하려면 npm ci"; else npm ci; fi

echo "== 3. 설정 파일"
if [ -f .env ]; then echo ".env 있음"; else cp .env.example .env; echo ".env 만듦(.env.example 복사)"; fi

echo "== 4. 크롬(PPTX 캡처용)"
chrome="$(grep -E '^CHROME=' .env | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//' || true)"
[ -z "$chrome" ] && chrome="${CHROME_PATH:-}"
if [ -z "$chrome" ]; then
  for c in "/mnt/c/Program Files/Google/Chrome/Application/chrome.exe" "/mnt/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" \
           "/mnt/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" "/mnt/c/Program Files/Microsoft/Edge/Application/msedge.exe" \
           /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium /usr/bin/chromium-browser; do
    [ -e "$c" ] && { chrome="$c"; break; }; done; fi
if [ -n "$chrome" ] && [ -e "$chrome" ]; then echo "사용할 크롬: $chrome"
else echo "크롬을 찾지 못했습니다. PPTX를 쓰려면 크롬을 설치하거나 .env 의 CHROME= 에 경로를 적으세요(빌드와 수치 대조는 크롬 없이 됨)."; fi

echo "== 5. 회귀 시험"
node src/selftest.js   # npm test 와 같음(윈도우 npm이 잡힌 WSL에서도 돌도록 node로 직접 실행)
echo
echo "준비 끝. 새 논문: node src/new_paper.js <키> <PDF 경로>  → Claude에게 \"<키> 논문 파랑이로 만들어줘\""
