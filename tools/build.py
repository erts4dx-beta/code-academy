#!/usr/bin/env python3
"""content/*.txt (사람이 쓰기 쉬운 텍스트 형식) -> js/data/*.js (file:// 에서도 동작하는 데이터 스크립트).
사이트를 '보는' 데는 빌드가 필요 없습니다. 레슨을 수정/추가할 때만 실행하세요:  python3 tools/build.py
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, 'content')
OUT = os.path.join(ROOT, 'js', 'data')
LEVELS = ['입문', '초급', '중급', '고급']
ORDER = ['python', 'javascript', 'typescript', 'htmlcss', 'java', 'c', 'cpp', 'csharp', 'go', 'rust',
         'kotlin', 'swift', 'php', 'ruby', 'sql', 'bash', 'dart', 'r', 'lua', 'scala']


def inline(s):
    s = html.escape(s, quote=False)
    parts = re.split(r'(`[^`]+`)', s)
    out = []
    for p in parts:
        if len(p) > 1 and p.startswith('`') and p.endswith('`'):
            out.append('<code>' + p[1:-1] + '</code>')
        else:
            p = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', p)
            out.append(p)
    return ''.join(out)


def md(text, default_lang):
    """아주 작은 마크다운: 문단, ## 소제목, - 목록, 1. 목록, > 팁, ``` 코드블록, `인라인`, **굵게**"""
    lines = text.strip('\n').split('\n')
    out, i = [], 0
    while i < len(lines):
        ln = lines[i]
        st = ln.strip()
        if not st:
            i += 1
            continue
        if st.startswith('```'):
            lang = st[3:].strip() or default_lang
            buf = []
            i += 1
            while i < len(lines) and not lines[i].strip().startswith('```'):
                buf.append(lines[i])
                i += 1
            i += 1
            out.append('<pre data-lang="%s"><code>%s</code></pre>' % (lang, html.escape('\n'.join(buf), quote=False)))
            continue
        if st.startswith('## '):
            out.append('<h3>%s</h3>' % inline(st[3:]))
            i += 1
            continue
        if st.startswith('> '):
            buf = []
            while i < len(lines) and lines[i].strip().startswith('>'):
                buf.append(lines[i].strip()[1:].strip())
                i += 1
            out.append('<div class="tip">%s</div>' % inline(' '.join(buf)))
            continue
        if st.startswith('- '):
            items = []
            while i < len(lines) and lines[i].strip().startswith('- '):
                items.append(lines[i].strip()[2:])
                i += 1
            out.append('<ul>%s</ul>' % ''.join('<li>%s</li>' % inline(x) for x in items))
            continue
        if re.match(r'^\d+\. ', st):
            items = []
            while i < len(lines) and re.match(r'^\d+\. ', lines[i].strip()):
                items.append(re.sub(r'^\d+\. ', '', lines[i].strip()))
                i += 1
            out.append('<ol>%s</ol>' % ''.join('<li>%s</li>' % inline(x) for x in items))
            continue
        buf = []
        while i < len(lines) and lines[i].strip() and not re.match(r'^(```|## |> |- |\d+\. )', lines[i].strip()):
            buf.append(lines[i].strip())
            i += 1
        out.append('<p>%s</p>' % inline(' '.join(buf)))
    return '\n'.join(out)


def plain(text):
    t = re.sub(r'```.*?```', ' ', text, flags=re.S)
    t = re.sub(r'[`*>#]', '', t)
    return re.sub(r'\s+', ' ', t).strip()


def parse_quiz(text, where):
    qs, cur = [], None
    for ln in text.split('\n'):
        s = ln.strip()
        if not s:
            continue
        if s.startswith('? '):
            cur = {'q': inline(s[2:]), 'options': [], 'answer': -1, 'explain': ''}
            qs.append(cur)
        elif s.startswith('+ ') or s.startswith('- '):
            if s.startswith('+ '):
                cur['answer'] = len(cur['options'])
            cur['options'].append(inline(s[2:]))
        elif s.startswith('! '):
            cur['explain'] = inline(s[2:])
        else:
            raise SystemExit('퀴즈 형식 오류 %s: %r' % (where, s))
    for q in qs:
        if q['answer'] < 0 or len(q['options']) < 2:
            raise SystemExit('퀴즈에 정답(+)이 없음 %s: %s' % (where, q['q']))
    return qs


def parse_file(path):
    raw = open(path, encoding='utf-8').read().replace('\r\n', '\n')
    head, *chunks = re.split(r'^=== ', raw, flags=re.M)
    meta = {}
    for ln in head.split('\n'):
        m = re.match(r'^@(\w+)\s+(.*)$', ln.strip())
        if m:
            meta[m.group(1)] = m.group(2).strip()
    lang = {
        'id': meta['id'], 'name': meta['name'], 'badge': meta.get('badge', meta['name'][:2]),
        'color': meta.get('color', '#666'), 'difficulty': int(meta.get('difficulty', 3)),
        'category': meta.get('category', ''), 'uses': [u.strip() for u in meta.get('uses', '').split('·') if u.strip()],
        'desc': meta.get('desc', ''), 'hl': meta.get('hl', meta['id']), 'year': meta.get('year', ''),
        'lessons': []
    }
    seen = set()
    for ch in chunks:
        header, _, rest = ch.partition('\n')
        level, lid, title = [x.strip() for x in header.split('|', 2)]
        if level not in LEVELS:
            raise SystemExit('알 수 없는 레벨 %s in %s' % (level, path))
        if lid in seen:
            raise SystemExit('중복 레슨 id %s in %s' % (lid, path))
        seen.add(lid)
        sections = re.split(r'^--- ', rest, flags=re.M)
        body = sections[0]
        les = {'id': lid, 'level': level, 'title': title, 'body': md(body, lang['hl']),
               'code': '', 'codeLang': lang['hl'], 'exercise': '', 'solution': '', 'solutionLang': lang['hl'],
               'quiz': []}
        text_parts = [title, plain(body)]
        for sec in sections[1:]:
            name, _, content = sec.partition('\n')
            name = name.strip().split()
            key, arg = name[0], (name[1] if len(name) > 1 else None)
            content = content.strip('\n')
            if key == 'code':
                les['code'] = content.rstrip()
                if arg: les['codeLang'] = arg
            elif key == 'solution':
                les['solution'] = content.rstrip()
                if arg: les['solutionLang'] = arg
            elif key == 'exercise':
                les['exercise'] = md(content, lang['hl'])
                text_parts.append(plain(content))
            elif key == 'quiz':
                les['quiz'] = parse_quiz(content, '%s/%s' % (lang['id'], lid))
            else:
                raise SystemExit('알 수 없는 섹션 %s in %s/%s' % (key, lang['id'], lid))
        les['text'] = ' '.join(text_parts)[:1200]
        lang['lessons'].append(les)
    lang['lessons'].sort(key=lambda l: LEVELS.index(l['level']))  # 안정 정렬: 같은 레벨 안에서는 작성 순서 유지
    return lang


def main():
    files = [f for f in os.listdir(CONTENT) if f.endswith('.txt')]
    langs = {}
    for f in files:
        L = parse_file(os.path.join(CONTENT, f))
        langs[L['id']] = L
    ids = [i for i in ORDER if i in langs] + sorted(i for i in langs if i not in ORDER)
    for old in os.listdir(OUT):
        if old.startswith('lang-') and old.endswith('.js'):
            os.remove(os.path.join(OUT, old))
    total = 0
    for i in ids:
        L = langs[i]
        total += len(L['lessons'])
        with open(os.path.join(OUT, 'lang-%s.js' % i), 'w', encoding='utf-8') as fp:
            fp.write('/* 자동 생성 파일: content/%s.txt 를 수정한 뒤 tools/build.py 를 실행하세요 */\n' % i)
            fp.write('CA.registerLanguage(%s);\n' % json.dumps(L, ensure_ascii=False, separators=(',', ':')))
        print('%-12s %2d lessons  %s' % (i, len(L['lessons']), ' '.join('%s:%d' % (lv, sum(1 for x in L['lessons'] if x['level'] == lv)) for lv in LEVELS)))
    # index.html 의 데이터 스크립트 태그 갱신
    idx = os.path.join(ROOT, 'index.html')
    src = open(idx, encoding='utf-8').read()
    tags = '\n'.join('  <script src="js/data/lang-%s.js"></script>' % i for i in ids)
    src = re.sub(r'(<!-- DATA:START -->)(.*?)(<!-- DATA:END -->)', lambda m: m.group(1) + '\n' + tags + '\n  ' + m.group(3), src, flags=re.S)
    open(idx, 'w', encoding='utf-8').write(src)
    print('총 %d개 언어, %d개 레슨' % (len(ids), total))


if __name__ == '__main__':
    main()
