/* 코드 아카데미 앱 셸: 해시 라우팅, 렌더링, 진도, 검색, 테마, 플레이그라운드 */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var app = $('#app');
  var LEVELS = CA.LEVELS;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stripTags(s) { var d = document.createElement('div'); d.innerHTML = s; return d.textContent; }

  /* ---------- 저장소 / 진도 ---------- */
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }
  };
  var progress = store.get('ca-progress', {});
  function pkey(l, id) { return l + '/' + id; }
  function isDone(l, id) { return !!progress[pkey(l, id)]; }
  function setDone(l, id, v) { if (v) progress[pkey(l, id)] = Date.now(); else delete progress[pkey(l, id)]; store.set('ca-progress', progress); }
  function langProg(L) { var d = 0; L.lessons.forEach(function (x) { if (isDone(L.id, x.id)) d++; }); return { done: d, total: L.lessons.length, pct: L.lessons.length ? Math.round(d * 100 / L.lessons.length) : 0 }; }
  var TOTAL = 0, QUIZ_TOTAL = 0;
  CA.languages.forEach(function (L) { TOTAL += L.lessons.length; L.lessons.forEach(function (x) { QUIZ_TOTAL += x.quiz.length; }); });
  function doneCount() { var n = 0; CA.languages.forEach(function (L) { n += langProg(L).done; }); return n; }

  /* ---------- UI 조각 ---------- */
  function toast(msg) { var t = $('#toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(function () { t.classList.remove('show'); }, 2600); }
  function stars(n) { var s = ''; for (var i = 1; i <= 5; i++) s += i <= n ? '★' : '<span class="off">★</span>'; return '<span class="stars" title="난이도 ' + n + '/5">' + s + '</span>'; }
  var DIFF = ['', '매우 쉬움', '쉬움', '보통', '어려움', '매우 어려움'];
  function badge(L) { return '<span class="badge" style="--lc:' + L.color + ';background:' + L.color + '">' + esc(L.badge) + '</span>'; }
  function bar(p) { return '<div class="progress"><span style="width:' + p + '%"></span></div>'; }
  function lv(level) { return '<span class="pill lv-' + level + '">' + level + '</span>'; }
  function codeBlock(code, lang, label) {
    var run = (lang === 'javascript' || lang === 'js') ? '<button class="code-btn run" data-run title="브라우저에서 실행">▶ 실행</button><button class="code-btn" data-topg title="플레이그라운드에서 열기">↗ 편집</button>' : '';
    return '<div class="code-box"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span>' + esc(label || highlightLangName(lang)) + '</span><span class="sp"></span>' + run +
      '<button class="code-btn" data-copy title="코드 복사">복사</button></div><pre><code class="hl" data-lang="' + esc(lang) + '">' + esc(code) + '</code></pre></div>';
  }
  function enhance(root) {
    $$('.prose pre[data-lang]', root).forEach(function (pre) {
      var wrap = document.createElement('div');
      wrap.innerHTML = codeBlock(pre.textContent, pre.getAttribute('data-lang'));
      pre.parentNode.replaceChild(wrap.firstChild, pre);
    });
    $$('code.hl:not(.done)', root).forEach(function (c) { c.innerHTML = highlightCode(c.textContent, c.getAttribute('data-lang')); c.classList.add('done'); });
  }
  function langCard(L) {
    var p = langProg(L);
    return '<a class="lang-card" href="#/lang/' + L.id + '" style="--lc:' + L.color + '" data-cat="' + esc(L.category) + '">' +
      '<div class="lang-head">' + badge(L) + '<div><h3>' + esc(L.name) + '</h3>' + stars(L.difficulty) + ' <small class="muted">' + DIFF[L.difficulty] + '</small></div></div>' +
      '<p>' + esc(L.desc) + '</p><div class="tags">' + L.uses.slice(0, 4).map(function (u) { return '<span class="tag">' + esc(u) + '</span>'; }).join('') + '</div>' +
      '<div class="card-foot"><span>' + L.lessons.length + '개 레슨</span>' + bar(p.pct) + '<span>' + p.pct + '%</span></div></a>';
  }
  function langGrid(id) {
    return '<div class="filters" id="' + id + '-f" style="margin-bottom:16px">' + CA.categories.map(function (c, i) { return '<button class="chip' + (i ? '' : ' active') + '" data-cat="' + c + '">' + c + '</button>'; }).join('') +
      '</div><div class="lang-grid" id="' + id + '">' + CA.languages.map(langCard).join('') + '</div>';
  }
  function bindGrid(id) {
    var f = $('#' + id + '-f'); if (!f) return;
    f.addEventListener('click', function (e) {
      var b = e.target.closest('.chip'); if (!b) return;
      $$('.chip', f).forEach(function (x) { x.classList.toggle('active', x === b); });
      var c = b.getAttribute('data-cat');
      $$('#' + id + ' .lang-card').forEach(function (card) { card.style.display = (c === '전체' || card.getAttribute('data-cat').split(',').indexOf(c) >= 0) ? '' : 'none'; });
    });
  }

  /* ---------- 페이지: 홈 ---------- */
  function renderHome() {
    var last = store.get('ca-last', null), cont = '';
    if (last && CA.byId[last.lang]) {
      var L = CA.byId[last.lang], les = L.lessons.filter(function (x) { return x.id === last.id; })[0];
      if (les) cont = '<div class="section-title"><h2>이어서 학습하기</h2></div><a class="continue-card" href="#/lang/' + L.id + '/' + les.id + '">' + badge(L) +
        '<div style="flex:1"><div class="muted" style="font-size:.85rem">' + esc(L.name) + ' · ' + les.level + '</div><b>' + esc(les.title) + '</b>' + bar(langProg(L).pct) + '</div><span class="btn primary small">계속 →</span></a>';
    }
    var sample = 'def greet(name):\n    return f"안녕, {name}!"\n\nfor lang in ["Python", "Rust", "Go"]:\n    print(greet(lang))\n# 안녕, Python!  안녕, Rust! ...';
    app.innerHTML = '<div class="container">' +
      '<section class="hero"><h1>모든 프로그래밍 언어를<br><span class="grad">한 걸음씩, 단계별로</span></h1>' +
      '<p>' + CA.languages.length + '개 언어 · ' + TOTAL + '개 레슨. 입문부터 고급까지 설명 → 예제 코드 → 실습 과제 → 퀴즈 순서로 탄탄하게 배웁니다. 설치 없이 브라우저에서 바로 시작하세요.</p>' +
      '<div class="hero-actions"><a class="btn primary" href="#/lang/python">🐍 Python으로 시작하기</a><a class="btn" href="#/roadmap">🗺️ 학습 로드맵 보기</a><a class="btn" href="#/playground">▶ JS 플레이그라운드</a></div>' +
      '<div class="hero-code"><code class="hl" data-lang="python">' + esc(sample) + '</code></div></section>' +
      '<div class="stats"><div class="stat"><b>' + CA.languages.length + '</b><span>프로그래밍 언어</span></div><div class="stat"><b>' + TOTAL + '</b><span>단계별 레슨</span></div>' +
      '<div class="stat"><b>' + QUIZ_TOTAL + '</b><span>퀴즈 문항</span></div><div class="stat"><b>' + doneCount() + '</b><span>내가 완료한 레슨</span></div></div>' +
      cont +
      '<div class="section-title"><h2>언어 선택</h2><a href="#/roadmap">무엇부터 배울지 모르겠다면? 로드맵 →</a></div>' + langGrid('homeGrid') +
      '<div class="section-title"><h2>이렇게 배웁니다</h2></div><div class="features">' +
      [['📚', '4단계 커리큘럼', '입문 → 초급 → 중급 → 고급으로 이어지는 체계적인 순서'], ['💻', '예제 코드', '구문 강조와 복사 버튼, JavaScript는 바로 실행까지'], ['✍️', '실습 과제', '직접 풀어 보고 정답을 펼쳐 비교하기'], ['✅', '즉시 채점 퀴즈', '핵심 개념을 퀴즈로 확인, 통과하면 자동 완료'],
        ['📈', '진도 추적', '완료한 레슨과 언어별 진행률이 브라우저에 저장'], ['🔎', '전체 검색', '모든 언어의 레슨을 한 번에 검색 ( / 키)'], ['🌗', '다크 모드', '눈이 편한 테마로 언제든 전환'], ['📱', '모바일 지원', '휴대폰에서도 편하게 학습']].map(function (f) { return '<div class="feature"><div class="ico">' + f[0] + '</div><b>' + f[1] + '</b><span>' + f[2] + '</span></div>'; }).join('') +
      '</div></div>';
    bindGrid('homeGrid');
    return '홈';
  }

  function renderLanguages() {
    app.innerHTML = '<div class="container"><h1>전체 언어</h1><p class="muted">관심 분야로 필터링하세요. 카드의 별은 학습 난이도(1~5)입니다.</p>' + langGrid('allGrid') + '</div>';
    bindGrid('allGrid');
    return '전체 언어';
  }

  /* ---------- 페이지: 언어 개요 ---------- */
  function renderLang(id) {
    var L = CA.byId[id], p = langProg(L);
    var next = L.lessons.filter(function (x) { return !isDone(L.id, x.id); })[0] || L.lessons[0];
    var tracks = CA.roadmap.filter(function (t) { return t.steps.some(function (s) { return s.lang === id; }); });
    var idx = 0;
    app.innerHTML = '<div class="container"><div class="crumbs"><a href="#/">홈</a>›<a href="#/languages">언어</a>›<span>' + esc(L.name) + '</span></div>' +
      '<section class="lang-hero" style="--lc:' + L.color + ';margin-top:12px">' + badge(L) + '<div style="flex:1"><h1>' + esc(L.name) + '</h1><p>' + esc(L.desc) + '</p>' +
      '<div class="lesson-meta">' + stars(L.difficulty) + '<span>난이도: ' + DIFF[L.difficulty] + '</span>' + (L.year ? '<span>· 등장: ' + esc(L.year) + '</span>' : '') + '<span>· ' + L.lessons.length + '개 레슨</span></div>' +
      '<div class="tags">' + L.uses.map(function (u) { return '<span class="tag">' + esc(u) + '</span>'; }).join('') + '</div></div></section>' +
      '<div class="complete-bar" style="border-style:solid"><div style="flex:1;min-width:220px"><b>내 진행률 ' + p.done + ' / ' + p.total + ' (' + p.pct + '%)</b>' + bar(p.pct) + '</div>' +
      '<a class="btn primary" href="#/lang/' + L.id + '/' + next.id + '">' + (p.done ? '이어서 학습 →' : '첫 레슨 시작 →') + '</a></div>' +
      '<div class="section-title"><h2>단계별 커리큘럼</h2></div><div class="curriculum">' +
      LEVELS.map(function (lvName) {
        var ls = L.lessons.filter(function (x) { return x.level === lvName; }); if (!ls.length) return '';
        var dn = ls.filter(function (x) { return isDone(L.id, x.id); }).length;
        return '<div class="level-col"><h3>' + lv(lvName) + '<small class="muted">' + dn + '/' + ls.length + '</small></h3><div class="desc">' + CA.levelDesc[lvName] + '</div><ol>' +
          ls.map(function (x) { idx++; return '<li><a class="' + (isDone(L.id, x.id) ? 'done' : '') + '" href="#/lang/' + L.id + '/' + x.id + '"><span class="n">' + (isDone(L.id, x.id) ? '✓' : idx) + '</span><span>' + esc(x.title) + '</span></a></li>'; }).join('') + '</ol></div>';
      }).join('') + '</div>' +
      (tracks.length ? '<div class="section-title"><h2>이 언어가 포함된 로드맵</h2></div><div class="tags">' + tracks.map(function (t) { return '<a class="chip" href="#/roadmap/' + t.id + '">' + t.icon + ' ' + esc(t.title) + '</a>'; }).join(' ') + '</div>' : '') +
      '</div>';
    return L.name + ' 배우기';
  }

  /* ---------- 페이지: 레슨 ---------- */
  function sidebar(L, cur) {
    var p = langProg(L), n = 0;
    return '<aside class="sidebar" id="sidebar"><a class="side-lang" href="#/lang/' + L.id + '">' + badge(L) + '<span>' + esc(L.name) + '</span></a>' +
      '<select class="side-switch" id="langSwitch" aria-label="언어 바꾸기">' + CA.languages.map(function (x) { return '<option value="' + x.id + '"' + (x.id === L.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') + '</select>' +
      '<div class="side-prog">진행률 ' + p.done + '/' + p.total + ' · ' + p.pct + '%' + bar(p.pct) + '</div>' +
      LEVELS.map(function (lvName) {
        var ls = L.lessons.filter(function (x) { return x.level === lvName; }); if (!ls.length) return '';
        return '<div class="side-level"><h4>' + lv(lvName) + '<span>' + ls.filter(function (x) { return isDone(L.id, x.id); }).length + '/' + ls.length + '</span></h4>' +
          ls.map(function (x) { n++; var d = isDone(L.id, x.id); return '<a href="#/lang/' + L.id + '/' + x.id + '" class="' + (x.id === cur ? 'active ' : '') + (d ? 'done' : '') + '"><span class="chk">' + (d ? '✓' : '') + '</span><span>' + n + '. ' + esc(x.title) + '</span></a>'; }).join('') + '</div>';
      }).join('') + '</aside>';
  }

  function renderLesson(lid, sid) {
    var L = CA.byId[lid], i = -1;
    L.lessons.forEach(function (x, k) { if (x.id === sid) i = k; });
    if (i < 0) return render404();
    var les = L.lessons[i], prev = L.lessons[i - 1], next = L.lessons[i + 1];
    store.set('ca-last', { lang: L.id, id: les.id });
    var mins = Math.max(4, Math.round((stripTags(les.body).length + les.code.length + les.quiz.length * 200) / 350));
    var html = '<div class="lesson-layout">' + sidebar(L, les.id) + '<article class="lesson-main" id="lessonMain">' +
      '<div class="crumbs"><button class="btn small only-mobile" id="tocBtn">📚 목차</button><a href="#/">홈</a>›<a href="#/lang/' + L.id + '">' + esc(L.name) + '</a>›<span>' + les.level + '</span></div>' +
      '<h1 class="lesson-title">' + esc(les.title) + '</h1><div class="lesson-meta">' + lv(les.level) + '<span>레슨 ' + (i + 1) + ' / ' + L.lessons.length + '</span><span>· 약 ' + mins + '분</span>' +
      (isDone(L.id, les.id) ? '<span class="pill" style="background:var(--ok-soft);color:var(--ok)">✓ 완료</span>' : '') + '</div>' +
      '<div class="prose">' + les.body + '</div>';
    var sec = 0;
    if (les.code) html += '<h2 class="block-title"><span class="num">' + (++sec) + '</span>예제 코드</h2>' + codeBlock(les.code, les.codeLang);
    if (les.exercise) {
      html += '<h2 class="block-title"><span class="num">' + (++sec) + '</span>실습 과제</h2><div class="exercise"><div class="prose">' + les.exercise + '</div>' +
        (les.solution ? '<button class="btn small sol-toggle" id="solBtn">🔒 정답 보기</button><div class="solution" id="solBox" hidden><p class="muted" style="margin:10px 0 0;font-size:.9rem">먼저 직접 풀어 본 뒤 비교해 보세요. 정답은 여러 가지일 수 있습니다.</p>' + codeBlock(les.solution, les.solutionLang, highlightLangName(les.solutionLang) + ' · 예시 정답') + '</div>' : '') + '</div>';
    }
    if (les.quiz.length) {
      html += '<h2 class="block-title"><span class="num">' + (++sec) + '</span>퀴즈</h2><div id="quiz">' + les.quiz.map(function (q, qi) {
        return '<div class="quiz-q" data-qi="' + qi + '"><div class="q"><small>Q' + (qi + 1) + '.</small>' + q.q + '</div><div class="opts">' +
          q.options.map(function (o, oi) { return '<button class="opt" data-oi="' + oi + '"><span class="k">' + String.fromCharCode(65 + oi) + '</span><span>' + o + '</span></button>'; }).join('') + '</div><div class="fb"></div></div>';
      }).join('') + '</div>';
    }
    html += '<div class="complete-bar"><div><b>이 레슨을 마쳤나요?</b><div class="muted" style="font-size:.88rem">퀴즈를 모두 맞히면 자동으로 완료 처리됩니다.</div></div><button class="btn" id="doneBtn"></button></div>' +
      '<nav class="pager">' + (prev ? '<a class="prev" href="#/lang/' + L.id + '/' + prev.id + '"><small>← 이전 레슨 · ' + prev.level + '</small>' + esc(prev.title) + '</a>' : '<a class="prev" href="#/lang/' + L.id + '"><small>← 개요</small>' + esc(L.name) + ' 커리큘럼</a>') +
      (next ? '<a class="next" href="#/lang/' + L.id + '/' + next.id + '"><small>다음 레슨 · ' + next.level + ' →</small>' + esc(next.title) + '</a>' : '<a class="next" href="#/roadmap"><small>🎉 마지막 레슨입니다 →</small>로드맵에서 다음 언어 고르기</a>') +
      '</nav></article></div>';
    app.innerHTML = html;

    var doneBtn = $('#doneBtn');
    function syncDone() {
      var d = isDone(L.id, les.id);
      doneBtn.className = 'btn ' + (d ? 'success' : 'primary');
      doneBtn.textContent = d ? '✓ 완료됨 (취소하려면 클릭)' : '완료로 표시';
      var a = $('.side-level a.active'); if (a) { a.classList.toggle('done', d); $('.chk', a).textContent = d ? '✓' : ''; }
      var p = langProg(L); $('.side-prog').innerHTML = '진행률 ' + p.done + '/' + p.total + ' · ' + p.pct + '%' + bar(p.pct);
    }
    doneBtn.addEventListener('click', function () { var d = !isDone(L.id, les.id); setDone(L.id, les.id, d); syncDone(); toast(d ? '✅ 레슨 완료! 잘했어요.' : '완료 표시를 취소했습니다.'); });
    syncDone();
    var sb = $('#solBtn');
    if (sb) sb.addEventListener('click', function () { var b = $('#solBox'); b.hidden = !b.hidden; sb.textContent = b.hidden ? '🔒 정답 보기' : '🔓 정답 숨기기'; });
    $('#langSwitch').addEventListener('change', function () { location.hash = '#/lang/' + this.value; });
    var toc = $('#tocBtn'); if (toc) toc.addEventListener('click', function () { document.body.classList.add('side-open'); });
    var solved = {};
    var qz = $('#quiz');
    if (qz) qz.addEventListener('click', function (e) {
      var box = e.target.closest('.quiz-q'); if (!box) return;
      var q = les.quiz[+box.getAttribute('data-qi')];
      if (e.target.closest('.retry')) { $$('.opt', box).forEach(function (o) { o.disabled = false; o.classList.remove('correct', 'wrong'); }); $('.fb', box).innerHTML = ''; return; }
      var opt = e.target.closest('.opt'); if (!opt || opt.disabled) return;
      var oi = +opt.getAttribute('data-oi'), ok = oi === q.answer;
      $$('.opt', box).forEach(function (o) { o.disabled = true; if (+o.getAttribute('data-oi') === q.answer && ok) o.classList.add('correct'); });
      if (!ok) opt.classList.add('wrong');
      $('.fb', box).innerHTML = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? '정답입니다! 🎉' : '아쉬워요, 오답입니다.') + '</b>' + (ok && q.explain ? '<span class="ex">' + q.explain + '</span>' : '') + (!ok ? '<span class="ex">힌트: 본문을 다시 읽고 한 번 더 도전해 보세요.</span>' : '') + '</div>' + (ok ? '' : '<button class="btn small retry">다시 풀기</button>');
      if (ok) {
        solved[box.getAttribute('data-qi')] = 1;
        if (Object.keys(solved).length === les.quiz.length && !isDone(L.id, les.id)) { setDone(L.id, les.id, true); syncDone(); toast('🎉 퀴즈 통과! 레슨을 완료로 표시했습니다.'); }
      }
    });
    var act = $('.side-level a.active'); if (act && act.scrollIntoView) { var sbEl = $('#sidebar'); sbEl.scrollTop = act.offsetTop - sbEl.clientHeight / 3; }
    return les.title + ' - ' + L.name;
  }

  /* ---------- 페이지: 로드맵 ---------- */
  function renderRoadmap(focus) {
    app.innerHTML = '<div class="container"><h1>🗺️ 추천 학습 로드맵</h1><p class="muted">목표에 맞는 트랙을 고르고 왼쪽부터 순서대로 학습하세요. 각 단계를 누르면 해당 언어의 커리큘럼으로 이동합니다. 막대는 내 진행률입니다.</p>' +
      '<div class="filters" style="margin:16px 0 22px">' + CA.roadmap.map(function (t) { return '<a class="chip" href="#/roadmap/' + t.id + '">' + t.icon + ' ' + esc(t.title) + '</a>'; }).join('') + '</div>' +
      '<div class="tracks">' + CA.roadmap.map(function (t) {
        return '<section class="track" id="track-' + t.id + '"><div class="track-head"><span class="ico">' + t.icon + '</span><div><h2>' + esc(t.title) + '</h2><p>' + esc(t.desc) + '</p></div></div><div class="steps">' +
          t.steps.map(function (s, k) {
            if (s.ext) return '<div class="step ext"><div class="s-n">STEP ' + (k + 1) + ' · 다음 단계</div><div class="s-t">🚀 ' + esc(s.ext) + '</div><div class="s-d">' + esc(s.focus) + '</div></div>';
            var L = CA.byId[s.lang]; if (!L) return '';
            var p = langProg(L);
            return '<a class="step" href="#/lang/' + L.id + '"><div class="s-n">STEP ' + (k + 1) + '</div><div class="s-t">' + badge(L) + esc(L.name) + '</div><div class="s-d">' + esc(s.focus) + '</div><div class="s-p">' + bar(p.pct) + '</div></a>';
          }).join('') + '</div></section>';
      }).join('') + '</div>' +
      '<div class="tip" style="margin-top:28px">어떤 트랙이든 <b>첫 언어 하나를 중급까지</b> 깊게 배우는 것이 여러 언어를 얕게 배우는 것보다 효과적입니다. 두 번째 언어부터는 개념이 같아서 훨씬 빨리 익힐 수 있어요.</div></div>';
    if (focus) { var el = $('#track-' + focus); if (el) setTimeout(function () { el.scrollIntoView({ behavior: 'smooth' }); el.style.borderColor = 'var(--accent)'; }, 30); }
    return '학습 로드맵';
  }

  /* ---------- 페이지: 내 학습 ---------- */
  function renderProgress() {
    var dn = doneCount(), pct = TOTAL ? Math.round(dn * 100 / TOTAL) : 0;
    var recent = Object.keys(progress).map(function (k) { return [k, progress[k]]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 10);
    var langs = CA.languages.slice().sort(function (a, b) { return langProg(b).pct - langProg(a).pct; });
    app.innerHTML = '<div class="container"><h1>📈 내 학습 현황</h1>' +
      '<div class="stats"><div class="stat"><b>' + dn + ' / ' + TOTAL + '</b><span>완료한 레슨</span></div><div class="stat"><b>' + pct + '%</b><span>전체 진행률</span></div>' +
      '<div class="stat"><b>' + CA.languages.filter(function (L) { return langProg(L).done > 0; }).length + '</b><span>학습 중인 언어</span></div><div class="stat"><b>' + CA.languages.filter(function (L) { var p = langProg(L); return p.done === p.total; }).length + '</b><span>완주한 언어</span></div></div>' +
      '<div class="section-title"><h2>언어별 진행률</h2><button class="btn small" id="resetBtn">진도 초기화</button></div><div class="prog-list">' +
      langs.map(function (L) { var p = langProg(L); return '<a class="prog-row" href="#/lang/' + L.id + '">' + badge(L) + '<b>' + esc(L.name) + '</b>' + bar(p.pct) + '<span class="muted">' + p.done + '/' + p.total + '</span></a>'; }).join('') + '</div>' +
      '<div class="section-title"><h2>최근 완료한 레슨</h2></div>' +
      (recent.length ? '<div class="results">' + recent.map(function (r) {
        var parts = r[0].split('/'), L = CA.byId[parts[0]]; if (!L) return '';
        var les = L.lessons.filter(function (x) { return x.id === parts[1]; })[0]; if (!les) return '';
        return '<a class="res" href="#/lang/' + L.id + '/' + les.id + '"><b>' + esc(les.title) + '</b><div class="snip">' + esc(L.name) + ' · ' + les.level + ' · ' + new Date(r[1]).toLocaleString('ko-KR') + '</div></a>';
      }).join('') + '</div>' : '<p class="muted">아직 완료한 레슨이 없습니다. <a href="#/roadmap">로드맵</a>에서 시작해 보세요!</p>') + '</div>';
    $('#resetBtn').addEventListener('click', function () { if (confirm('모든 학습 진도를 초기화할까요? 되돌릴 수 없습니다.')) { progress = {}; store.set('ca-progress', progress); localStorage.removeItem('ca-last'); route(); toast('진도를 초기화했습니다.'); } });
    return '내 학습';
  }

  /* ---------- 검색 ---------- */
  var INDEX = [];
  CA.languages.forEach(function (L) { L.lessons.forEach(function (x) { INDEX.push({ L: L, les: x, title: x.title.toLowerCase(), hay: (x.title + ' ' + x.text + ' ' + L.name + ' ' + x.level).toLowerCase() }); }); });
  function search(q) {
    var terms = q.toLowerCase().split(/\s+/).filter(Boolean); if (!terms.length) return [];
    var res = [];
    INDEX.forEach(function (it) {
      var score = 0;
      for (var i = 0; i < terms.length; i++) {
        var t = terms[i];
        if (it.hay.indexOf(t) < 0) return;
        if (it.title.indexOf(t) >= 0) score += 10;
        if (it.L.name.toLowerCase() === t || it.L.id === t) score += 6;
        score += 1;
      }
      res.push({ it: it, score: score });
    });
    res.sort(function (a, b) { return b.score - a.score; });
    return res.map(function (r) { return r.it; });
  }
  function mark(text, q) {
    var s = esc(text);
    q.split(/\s+/).filter(Boolean).forEach(function (t) { var re = new RegExp('(' + esc(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'); s = s.replace(re, '<mark>$1</mark>'); });
    return s;
  }
  function snippet(text, q) {
    var t = q.toLowerCase().split(/\s+/).filter(Boolean)[0] || '', i = text.toLowerCase().indexOf(t);
    var start = Math.max(0, i - 40); var s = (start > 0 ? '…' : '') + text.slice(start, start + 130) + '…';
    return mark(s, q);
  }
  function renderSearch(q) {
    var r = search(q);
    app.innerHTML = '<div class="container"><h1>🔎 검색: “' + esc(q) + '”</h1><p class="muted">' + r.length + '개의 레슨을 찾았습니다.</p><div class="results">' +
      (r.length ? r.slice(0, 200).map(function (it) {
        return '<a class="res" href="#/lang/' + it.L.id + '/' + it.les.id + '"><div style="display:flex;gap:8px;align-items:center">' + badge(it.L).replace('class="badge"', 'class="badge" style="width:26px;height:26px;font-size:.6rem;border-radius:7px"') + '<b>' + mark(it.les.title, q) + '</b> ' + lv(it.les.level) + '<span class="muted" style="font-size:.85rem">' + esc(it.L.name) + '</span></div><div class="snip">' + snippet(it.les.text, q) + '</div></a>';
      }).join('') : '<p>검색 결과가 없습니다. 다른 키워드(예: <a href="#/search/반복문">반복문</a>, <a href="#/search/포인터">포인터</a>, <a href="#/search/클래스">클래스</a>, <a href="#/search/async">async</a>)로 시도해 보세요.</p>') + '</div></div>';
    $('#searchInput').value = q;
    return '검색: ' + q;
  }
  var sInput = $('#searchInput'), sPop = $('#searchPop'), sSel = -1;
  function closePop() { sPop.hidden = true; sSel = -1; }
  sInput.addEventListener('input', function () {
    var q = sInput.value.trim(); if (!q) return closePop();
    var r = search(q);
    sPop.innerHTML = r.length ? r.slice(0, 8).map(function (it) {
      return '<a href="#/lang/' + it.L.id + '/' + it.les.id + '"><div>' + mark(it.les.title, q) + '</div><div class="sr-meta">' + esc(it.L.name) + ' · ' + it.les.level + '</div></a>';
    }).join('') + '<a class="sr-more" href="#/search/' + encodeURIComponent(q) + '">모든 결과 보기 (' + r.length + ')</a>' : '<div class="empty">“' + esc(q) + '”에 대한 결과가 없습니다.</div>';
    sPop.hidden = false; sSel = -1;
  });
  sInput.addEventListener('keydown', function (e) {
    var items = $$('a', sPop);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault(); if (!items.length) return;
      sSel = (sSel + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items.forEach(function (a, i) { a.classList.toggle('sel', i === sSel); });
    } else if (e.key === 'Enter') {
      e.preventDefault(); var q = sInput.value.trim();
      if (sSel >= 0 && items[sSel]) location.hash = items[sSel].getAttribute('href'); else if (q) location.hash = '#/search/' + encodeURIComponent(q);
      closePop(); sInput.blur();
    } else if (e.key === 'Escape') { closePop(); sInput.blur(); }
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.search-wrap')) closePop(); });
  sPop.addEventListener('click', function (e) { if (e.target.closest('a')) { closePop(); sInput.value = ''; } });

  /* ---------- JavaScript 실행기 (샌드박스 iframe) ---------- */
  function sandboxMain(token) {
    function fmt(v, d) {
      d = d || 0;
      if (typeof v === 'string') return d ? JSON.stringify(v) : v;
      if (v === undefined) return 'undefined';
      if (typeof v === 'function') return '[Function: ' + (v.name || 'anonymous') + ']';
      if (typeof v === 'bigint') return v + 'n';
      if (typeof v === 'symbol') return v.toString();
      if (v === null || typeof v !== 'object') return String(v);
      if (v instanceof Error) return (v.stack && v.stack.indexOf(v.message) >= 0 ? v.name + ': ' + v.message : String(v));
      if (d > 3) return Array.isArray(v) ? '[Array]' : '[Object]';
      if (Array.isArray(v)) return v.length ? '[ ' + v.map(function (x) { return fmt(x, d + 1); }).join(', ') + ' ]' : '[]';
      if (v instanceof Map) return 'Map(' + v.size + ') {' + (v.size ? ' ' + Array.from(v).map(function (e) { return fmt(e[0], d + 1) + ' => ' + fmt(e[1], d + 1); }).join(', ') + ' ' : '') + '}';
      if (v instanceof Set) return 'Set(' + v.size + ') {' + (v.size ? ' ' + Array.from(v).map(function (x) { return fmt(x, d + 1); }).join(', ') + ' ' : '') + '}';
      if (v instanceof Date) return v.toISOString();
      if (typeof Promise !== 'undefined' && v instanceof Promise) return 'Promise { <pending> }';
      var name = v.constructor && v.constructor.name && v.constructor.name !== 'Object' ? v.constructor.name + ' ' : '';
      var ks = Object.keys(v);
      return name + (ks.length ? '{ ' + ks.map(function (k) { return (/^[A-Za-z_$][\w$]*$/.test(k) ? k : JSON.stringify(k)) + ': ' + fmt(v[k], d + 1); }).join(', ') + ' }' : '{}');
    }
    function send(type, args) { parent.postMessage({ token: token, type: type, text: Array.prototype.map.call(args || [], function (a) { return fmt(a); }).join(' ') }, '*'); }
    ['log', 'info', 'debug'].forEach(function (k) { console[k] = function () { send('log', arguments); }; });
    console.warn = function () { send('warn', arguments); };
    console.error = function () { send('err', arguments); };
    console.table = function (t) { send('log', [t]); };
    window.onerror = function (msg, s, l, c, err) { send('err', [err ? err.name + ': ' + err.message : msg]); return true; };
    window.addEventListener('unhandledrejection', function (e) { var r = e.reason; send('err', ['Uncaught (in promise) ' + (r && r.message ? r.name + ': ' + r.message : String(r))]); });
    window.addEventListener('message', function (e) {
      if (!e.data || e.data.token !== token || e.data.type !== 'run') return;
      var AsyncFn = Object.getPrototypeOf(async function () { }).constructor;
      var fn;
      try { fn = new AsyncFn(e.data.code); } catch (err) { send('err', [err.name + ': ' + err.message]); send('done'); return; }
      fn().then(function () { send('done'); }, function (err) { send('err', [err && err.message ? err.name + ': ' + err.message : String(err)]); send('done'); });
    });
    parent.postMessage({ token: token, type: 'ready' }, '*');
  }
  var activeRun = null;
  function runJS(code, out) {
    if (activeRun) activeRun.stop();
    out.hidden = false; out.innerHTML = '<span class="sys">실행 중…</span>';
    var token = 'r' + Math.random().toString(36).slice(2), first = true, t0 = performance.now(), finished = false;
    var ifr = document.createElement('iframe');
    ifr.setAttribute('sandbox', 'allow-scripts'); ifr.style.display = 'none'; ifr.title = 'js-sandbox';
    ifr.srcdoc = '<!DOCTYPE html><meta charset="utf-8"><script>(' + sandboxMain.toString() + ')(' + JSON.stringify(token) + ')<\/script>';
    function line(cls, text) { if (first) { out.innerHTML = ''; first = false; } var d = document.createElement('div'); if (cls) d.className = cls; d.textContent = text; out.appendChild(d); out.scrollTop = out.scrollHeight; }
    function onMsg(e) {
      var m = e.data; if (!m || m.token !== token) return;
      if (m.type === 'ready') ifr.contentWindow.postMessage({ token: token, type: 'run', code: code }, '*');
      else if (m.type === 'log') line('', m.text);
      else if (m.type === 'warn') line('warn', '⚠ ' + m.text);
      else if (m.type === 'err') line('err', '✖ ' + m.text);
      else if (m.type === 'done' && !finished) { finished = true; if (first) line('sys', '(출력 없음)'); line('sys', '— 실행 완료 (' + Math.round(performance.now() - t0) + 'ms) —'); }
    }
    window.addEventListener('message', onMsg);
    var killer = setTimeout(function () { if (!finished) line('warn', '⏱ 5초가 지나 실행을 중단했습니다. (무한 루프가 없는지 확인하세요)'); stop(); }, 5000);
    function stop() { clearTimeout(killer); window.removeEventListener('message', onMsg); if (ifr.parentNode) ifr.parentNode.removeChild(ifr); if (activeRun && activeRun.token === token) activeRun = null; }
    activeRun = { token: token, stop: stop };
    document.body.appendChild(ifr);
  }

  /* ---------- 페이지: 플레이그라운드 ---------- */
  var SAMPLES = {
    '기본 출력과 변수': 'const name = "코드 아카데미";\nlet count = 3;\nconsole.log(`안녕하세요, ${name}!`);\nfor (let i = 1; i <= count; i++) {\n  console.log(`${i}번째 반복`);\n}',
    '배열 메서드': 'const scores = [88, 92, 75, 64, 99];\nconst passed = scores.filter(s => s >= 80);\nconst avg = scores.reduce((a, b) => a + b, 0) / scores.length;\nconsole.log("합격:", passed);\nconsole.log("평균:", avg.toFixed(1));\nconsole.log("정렬:", [...scores].sort((a, b) => b - a));',
    '클래스': 'class Account {\n  #balance = 0;\n  constructor(owner) { this.owner = owner; }\n  deposit(n) { if (n <= 0) throw new Error("금액 오류"); this.#balance += n; return this; }\n  get balance() { return this.#balance; }\n}\nconst acc = new Account("길동").deposit(1000).deposit(500);\nconsole.log(acc.owner, acc.balance);\ntry { acc.deposit(-1); } catch (e) { console.error(e.message); }',
    '비동기 (async/await)': 'const wait = (ms, v) => new Promise(r => setTimeout(() => r(v), ms));\n\nasync function main() {\n  console.log("시작");\n  const [a, b] = await Promise.all([wait(300, "A"), wait(100, "B")]);\n  console.log("결과:", a, b);\n}\nawait main();\nconsole.log("끝");',
    'Map / Set': 'const words = "사과 바나나 사과 포도 바나나 사과".split(" ");\nconst freq = new Map();\nfor (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1);\nconsole.log(freq);\nconsole.log(new Set(words));\nconsole.log([...freq].sort((a, b) => b[1] - a[1])[0]);'
  };
  function renderPlayground() {
    var saved = store.get('ca-pg', null);
    app.innerHTML = '<div class="container"><h1>▶ JavaScript 플레이그라운드</h1><p class="muted">브라우저 안의 격리된 샌드박스에서 코드를 실행합니다. <code>console.log</code> 출력이 오른쪽에 표시되고, 최상위 <code>await</code>도 사용할 수 있습니다. 단축키: <code>Ctrl/⌘ + Enter</code> 실행.</p>' +
      '<div class="pg-tools"><button class="btn primary" id="pgRun">▶ 실행</button><select id="pgSample"><option value="">예제 불러오기…</option>' + Object.keys(SAMPLES).map(function (k) { return '<option>' + esc(k) + '</option>'; }).join('') + '</select><button class="btn" id="pgClear">출력 지우기</button><span class="muted" style="font-size:.85rem">코드는 자동 저장됩니다.</span></div>' +
      '<div class="pg"><div class="pg-pane"><div class="code-head"><span class="dots"><i></i><i></i><i></i></span><span>main.js</span></div><textarea id="pgCode" spellcheck="false" aria-label="코드 입력"></textarea></div>' +
      '<div class="pg-pane"><div class="code-head"><span>콘솔 출력</span></div><div class="run-out" id="pgOut"><span class="sys">▶ 실행을 눌러 결과를 확인하세요.</span></div></div></div></div>';
    var ta = $('#pgCode'), out = $('#pgOut');
    ta.value = saved || SAMPLES['기본 출력과 변수'];
    ta.addEventListener('input', function () { store.set('ca-pg', ta.value); });
    ta.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') { e.preventDefault(); var s = ta.selectionStart, en = ta.selectionEnd; ta.value = ta.value.slice(0, s) + '  ' + ta.value.slice(en); ta.selectionStart = ta.selectionEnd = s + 2; store.set('ca-pg', ta.value); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); runJS(ta.value, out); }
    });
    $('#pgRun').addEventListener('click', function () { runJS(ta.value, out); });
    $('#pgClear').addEventListener('click', function () { out.innerHTML = ''; });
    $('#pgSample').addEventListener('change', function () { if (this.value) { ta.value = SAMPLES[this.value]; store.set('ca-pg', ta.value); this.value = ''; } });
    return 'JavaScript 플레이그라운드';
  }

  function render404() {
    app.innerHTML = '<div class="container" style="text-align:center;padding:80px 20px"><h1>404 — 페이지를 찾을 수 없어요</h1><p class="muted">주소가 바뀌었거나 존재하지 않는 레슨입니다.</p><a class="btn primary" href="#/">홈으로</a></div>';
    return '찾을 수 없음';
  }

  /* ---------- 라우터 ---------- */
  function route() {
    var h; try { h = decodeURIComponent(location.hash.replace(/^#/, '')); } catch (e) { h = location.hash.slice(1); }
    var parts = (h || '/').split('/').filter(Boolean), nav = '', title;
    document.body.classList.remove('nav-open', 'side-open');
    if (activeRun) activeRun.stop();
    if (!parts.length) { title = renderHome(); nav = 'home'; }
    else if (parts[0] === 'languages') { title = renderLanguages(); nav = 'languages'; }
    else if (parts[0] === 'roadmap') { title = renderRoadmap(parts[1]); nav = 'roadmap'; }
    else if (parts[0] === 'playground') { title = renderPlayground(); nav = 'playground'; }
    else if (parts[0] === 'progress') { title = renderProgress(); nav = 'progress'; }
    else if (parts[0] === 'search') { title = renderSearch(parts.slice(1).join('/')); }
    else if (parts[0] === 'lang' && CA.byId[parts[1]]) { title = parts[2] ? renderLesson(parts[1], parts[2]) : renderLang(parts[1]); nav = 'languages'; }
    else title = render404();
    $$('#topnav a').forEach(function (a) { a.classList.toggle('active', a.getAttribute('data-nav') === nav); });
    document.title = title + ' | 코드 아카데미';
    enhance(app);
    if (!(parts[0] === 'roadmap' && parts[1])) window.scrollTo(0, 0);
  }

  /* ---------- 전역 이벤트 ---------- */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-copy]');
    if (b) {
      var code = b.closest('.code-box').querySelector('code').textContent;
      var okFn = function () { b.textContent = '복사됨 ✓'; setTimeout(function () { b.textContent = '복사'; }, 1500); };
      var fallback = function () { var ta = document.createElement('textarea'); ta.value = code; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); okFn(); } catch (er) { toast('복사에 실패했습니다.'); } document.body.removeChild(ta); };
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(okFn, fallback); else fallback();
      return;
    }
    var r = e.target.closest('[data-run]');
    if (r) {
      var box = r.closest('.code-box'), out = $('.run-out', box);
      if (!out) { out = document.createElement('div'); out.className = 'run-out'; box.appendChild(out); }
      runJS(box.querySelector('code').textContent, out); return;
    }
    var g = e.target.closest('[data-topg]');
    if (g) { store.set('ca-pg', g.closest('.code-box').querySelector('code').textContent); location.hash = '#/playground'; }
  });
  $('#themeBtn').addEventListener('click', function () {
    var t = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', t); store.set('ca-theme', t); try { localStorage.setItem('ca-theme', t); } catch (e) { }
    syncTheme();
  });
  function syncTheme() { $('#themeBtn').textContent = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙'; }
  $('#menuBtn').addEventListener('click', function () { document.body.classList.toggle('nav-open'); });
  $('#backdrop').addEventListener('click', function () { document.body.classList.remove('nav-open', 'side-open'); });
  document.addEventListener('keydown', function (e) {
    var tag = (document.activeElement && document.activeElement.tagName) || '';
    if (/INPUT|TEXTAREA|SELECT/.test(tag)) return;
    if (e.key === '/' && !e.ctrlKey && !e.metaKey) { e.preventDefault(); sInput.focus(); return; }
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !e.altKey && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
      var a = $(e.key === 'ArrowLeft' ? '.pager .prev' : '.pager .next'); if (a) location.hash = a.getAttribute('href');
    }
  });
  window.addEventListener('hashchange', route);
  syncTheme();
  route();
  window.CA_APP = { search: search, runJS: runJS };
})();
