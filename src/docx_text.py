#!/usr/bin/env python3
"""Word(.docx) 원고에서 텍스트와 그림을 뽑는다(외부 패키지 없이 표준 라이브러리만).
사용: python3 src/docx_text.py <원고.docx> <full.txt 저장 경로> [그림 저장 폴더]
- 본문 순서대로 문단과 표를 적는다. 제목 스타일은 '#', 표는 '| 칸 | 칸 |' 줄, 수식은 [수식: ...]
- 각주·미주는 끝에 [각주 n] 으로 붙인다. 그림은 word/media/* 를 그대로 복사(문서 안 순서: imageN)
- 줄 앞에 번호(L)를 붙이지 않는다. 노트에서는 grep -n 의 줄 번호를 쓴다
"""
import sys, zipfile, re, os, shutil
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
M = '{http://schemas.openxmlformats.org/officeDocument/2006/math}'
import xml.etree.ElementTree as ET

def run_text(el):
    out = []
    for n in el.iter():
        t = n.tag
        if t == W + 't' or t == M + 't':
            out.append(n.text or '')
        elif t == W + 'tab':
            out.append('\t')
        elif t in (W + 'br', W + 'cr'):
            out.append('\n')
        elif t == W + 'footnoteReference':
            out.append('[각주 %s]' % n.get(W + 'id'))
        elif t == W + 'endnoteReference':
            out.append('[미주 %s]' % n.get(W + 'id'))
    return ''.join(out)

def para(p):
    sty = p.find(W + 'pPr/' + W + 'pStyle')
    s = sty.get(W + 'val') if sty is not None else ''
    parts = []
    for ch in p:
        if ch.tag == M + 'oMath' or ch.tag == M + 'oMathPara':
            parts.append('[수식: ' + run_text(ch).strip() + ']')
        elif ch.tag != W + 'pPr':
            parts.append(run_text(ch))
    txt = ''.join(parts).strip()
    m = re.match(r'(?i)heading\s*(\d)|^(\d)$|title', s or '')
    if txt and s and (s.lower().startswith('heading') or s.lower() == 'title'):
        lvl = re.findall(r'\d', s)
        txt = '#' * (int(lvl[0]) if lvl else 1) + ' ' + txt
    if p.find('.//' + W + 'drawing') is not None or p.find('.//{urn:schemas-microsoft-com:vml}imagedata') is not None:
        txt = (txt + ' ' if txt else '') + '[그림]'
    return txt

def table(tb):
    rows = []
    for tr in tb.findall(W + 'tr'):
        cells = [' '.join(para(p) for p in tc.findall('.//' + W + 'p')).strip() for tc in tr.findall(W + 'tc')]
        rows.append('| ' + ' | '.join(cells) + ' |')
    return '\n'.join(rows)

def notes(z, name, label):
    if name not in z.namelist():
        return []
    root = ET.fromstring(z.read(name))
    out = []
    for n in root:
        i = n.get(W + 'id')
        if i is None or int(i) < 1:
            continue
        txt = ' '.join(para(p) for p in n.findall('.//' + W + 'p')).strip()
        if txt:
            out.append('[%s %s] %s' % (label, i, txt))
    return out

def main():
    src, dst = sys.argv[1], sys.argv[2]
    figdir = sys.argv[3] if len(sys.argv) > 3 else None
    z = zipfile.ZipFile(src)
    body = ET.fromstring(z.read('word/document.xml')).find(W + 'body')
    lines = []
    for el in body:
        if el.tag == W + 'p':
            t = para(el)
            if t:
                lines.append(t)
        elif el.tag == W + 'tbl':
            lines.append(table(el))
    extra = notes(z, 'word/footnotes.xml', '각주') + notes(z, 'word/endnotes.xml', '미주')
    if extra:
        lines += ['', '# 각주·미주'] + extra
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    with open(dst, 'w', encoding='utf8') as f:
        f.write('\n'.join(lines) + '\n')
    media = [n for n in z.namelist() if n.startswith('word/media/')]
    if figdir and media:
        os.makedirs(figdir, exist_ok=True)
        for n in media:
            with z.open(n) as a, open(os.path.join(figdir, os.path.basename(n)), 'wb') as b:
                shutil.copyfileobj(a, b)
    words = len(re.findall(r'\S+', '\n'.join(lines)))
    print('docx 추출: 문단·표 %d줄, 단어 약 %d개, 그림 %d개' % (len(lines), words, len(media)))

if __name__ == '__main__':
    main()
