#!/usr/bin/env bash
# Claude Code 웹(클라우드) 세션이 시작될 때 자동 실행(.claude/settings.json 의 SessionStart).
# 로컬 세션에서는 아무것도 하지 않는다(CLAUDE_CODE_REMOTE 가 true 일 때만 동작).
#  - poppler-utils(pdftotext, pdfinfo, pdftoppm)가 없으면 apt로 설치(클라우드는 root)
#  - package-lock.json 이 바뀌었거나 node_modules 가 없으면 npm ci
#  - .env 가 없으면 .env.example 에서 만듦(크롬은 클라우드의 CHROME_PATH 를 그대로 씀)
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
log(){ echo "[paper-deck 웹 준비] $*" >&2; }

if ! command -v pdftotext >/dev/null 2>&1; then
  if [ "$(id -u)" = "0" ]; then apt-get update -qq >/dev/null 2>&1 && apt-get install -y -qq poppler-utils >/dev/null 2>&1 && log "poppler-utils 설치" || log "poppler-utils 설치 실패(네트워크 설정의 패키지 관리자 허용 확인)"
  else sudo -n apt-get install -y -qq poppler-utils >/dev/null 2>&1 && log "poppler-utils 설치" || log "poppler-utils 설치 실패(root 아님)"; fi
fi

hash="$(sha256sum package-lock.json 2>/dev/null | cut -c1-16)"; mark="node_modules/.lock-hash"
if [ ! -f "$mark" ] || [ "$(cat "$mark" 2>/dev/null)" != "$hash" ]; then
  npm ci --no-audit --no-fund >/dev/null 2>&1 && echo "$hash" > "$mark" && log "npm ci 완료" || log "npm ci 실패(네트워크 설정의 패키지 관리자 허용 확인)"
fi

[ -f .env ] || cp .env.example .env
log "준비 완료(크롬: ${CHROME_PATH:-자동 탐색})"
exit 0
