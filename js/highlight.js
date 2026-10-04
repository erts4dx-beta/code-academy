/* 코드 아카데미 자체 구문 강조기 (외부 의존성 없음)
   토큰 클래스: cm 주석, st 문자열, nu 숫자, kw 키워드, lt 리터럴, ty 타입, bi 내장, fn 함수, va 변수, mt 메타/전처리, tg 태그, at 속성, pr 속성명, sl 선택자 */
(function () {
  function set(s) { var o = Object.create(null); s.split(/\s+/).forEach(function (w) { if (w) o[w] = 1; }); return o; }
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function sp(c, s) { return '<span class="t-' + c + '">' + esc(s) + '</span>'; }

  var C_LIKE_LIT = 'true false null';
  var L = {};
  L.python = { kw: set('and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case'),
    lt: set('True False None self cls'), ty: set('int str float bool list dict set tuple bytes object Exception ValueError TypeError KeyError IndexError ZeroDivisionError'),
    bi: set('print len range input open enumerate zip map filter sorted sum min max abs isinstance type super any all reversed round iter next repr format hasattr getattr setattr'),
    line: ['#'], strings: ['"""', "'''", '"', "'"], strPrefix: /[rbfuRBFU]{1,2}$/, deco: true, capType: true };
  L.javascript = { kw: set('var let const function return if else for while do break continue switch case default new delete typeof instanceof in of class extends super this import export from as async await yield try catch finally throw static get set void debugger'),
    lt: set('true false null undefined NaN Infinity'), ty: set('Array Object String Number Boolean Promise Map Set Date Math JSON Error RegExp Symbol BigInt WeakMap'),
    bi: set('console document window setTimeout setInterval clearTimeout fetch parseInt parseFloat require module globalThis structuredClone'),
    line: ['//'], block: [['/*', '*/']], strings: ['`', '"', "'"], dollarIdent: true, capType: true, regex: true };
  L.typescript = Object.assign({}, L.javascript, { kw: set('var let const function return if else for while do break continue switch case default new delete typeof instanceof in of class extends super this import export from as async await yield try catch finally throw static get set void interface type enum implements namespace declare abstract private public protected readonly keyof infer is satisfies'),
    ty: set('string number boolean any unknown never object void symbol bigint Array Promise Record Partial Readonly Pick Omit Required ReturnType Map Set Date Error'), deco: true });
  L.java = { kw: set('abstract assert break case catch class continue default do else enum extends final finally for if implements import instanceof interface native new package private protected public return static super switch synchronized this throw throws transient try volatile while var record sealed permits yield'),
    lt: set(C_LIKE_LIT), ty: set('int long short byte char boolean float double void String Integer Long Double Boolean Character Object List ArrayList Map HashMap Set HashSet Optional Stream Thread Runnable Exception RuntimeException'),
    bi: set('System Math Arrays Collections Collectors'), line: ['//'], block: [['/*', '*/']], strings: ['"""', '"', "'"], deco: true, capType: true };
  L.c = { kw: set('auto break case const continue default do else enum extern for goto if inline register restrict return sizeof static struct switch typedef union volatile while'),
    lt: set('NULL true false'), ty: set('int long short char float double void unsigned signed size_t bool uint8_t int32_t int64_t uint32_t uint64_t FILE'),
    bi: set('printf scanf malloc calloc realloc free strlen strcpy strcmp strcat memcpy memset fopen fclose fprintf fgets puts putchar exit'),
    line: ['//'], block: [['/*', '*/']], strings: ['"', "'"], pp: true };
  L.cpp = Object.assign({}, L.c, { kw: set('alignas auto break case catch class const constexpr consteval const_cast continue co_await co_return co_yield decltype default delete do dynamic_cast else enum explicit export extern for friend goto if inline mutable namespace new noexcept operator private protected public register reinterpret_cast return sizeof static static_assert static_cast struct switch template this thread_local throw try typedef typeid typename union using virtual volatile while override final concept requires'),
    lt: set('true false nullptr NULL'), ty: set('int long short char float double void unsigned signed bool size_t string vector map unordered_map set array pair tuple unique_ptr shared_ptr optional thread mutex auto'),
    bi: set('std cout cin endl cerr printf move make_unique make_shared sort find begin end') , capType: true });
  L.csharp = { kw: set('abstract as base break case catch class const continue default delegate do else enum event explicit extern finally fixed for foreach goto if implicit in interface internal is lock namespace new operator out override params private protected public readonly ref return sealed sizeof stackalloc static struct switch this throw try typeof unchecked unsafe using virtual volatile while var async await get set init record where yield when with required'),
    lt: set('true false null'), ty: set('int long short byte char bool float double decimal void string object dynamic List Dictionary Task IEnumerable Exception'),
    bi: set('Console Math String LINQ'), line: ['//'], block: [['/*', '*/']], strings: ['"', "'"], strPrefix: /[@$]{1,2}$/, pp: true, capType: true, deco: false };
  L.go = { kw: set('break case chan const continue default defer else fallthrough for func go goto if import interface map package range return select struct switch type var'),
    lt: set('true false nil iota'), ty: set('int int8 int16 int32 int64 uint uint8 uint16 uint32 uint64 float32 float64 string bool byte rune error any complex128'),
    bi: set('append cap close copy delete len make new panic print println recover fmt errors strings strconv sync time os'), line: ['//'], block: [['/*', '*/']], strings: ['`', '"', "'"], rawBacktick: true, capType: true };
  L.rust = { kw: set('as async await break const continue crate dyn else enum extern fn for if impl in let loop match mod move mut pub ref return static struct super trait type unsafe use where while'),
    lt: set('true false self Self None Some Ok Err'), ty: set('i8 i16 i32 i64 i128 isize u8 u16 u32 u64 u128 usize f32 f64 bool char str String Vec Option Result Box Rc Arc RefCell HashMap HashSet Mutex'),
    bi: set('std'), line: ['//'], block: [['/*', '*/']], strings: ['"'], rustChar: true, macro: true, attr: true, capType: true };
  L.php = { kw: set('abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile extends final finally fn for foreach function global goto if implements include include_once instanceof insteadof interface isset list match namespace new or print private protected public readonly require require_once return static switch throw trait try unset use var while yield enum'),
    lt: set('true false null TRUE FALSE NULL'), ty: set('int float string bool array object void mixed self'),
    bi: set('strlen count str_repeat array_map array_filter array_sum implode explode json_encode json_decode printf sprintf var_dump print_r htmlspecialchars in_array array_keys usort'),
    line: ['//', '#'], block: [['/*', '*/']], strings: ['"', "'"], dollarVar: true, phpTag: true, capType: true };
  L.sql = { kw: set('select from where and or not insert into values update set delete create table drop alter add primary key foreign references join inner left right full outer on group by order having limit offset as distinct union all case when then else end is null in between like index view with begin commit rollback transaction default unique check constraint exists asc desc over partition returning if replace cascade'),
    lt: set('true false'), ty: set('int integer bigint smallint varchar char text date timestamp boolean decimal numeric real serial float'),
    bi: set('count sum avg min max coalesce now row_number rank dense_rank lag lead upper lower length round cast substring'), line: ['--'], block: [['/*', '*/']], strings: ["'", '"'], ci: true };
  L.bash = { kw: set('if then else elif fi for while until do done case esac in function return local export readonly declare break continue select time set shift trap'),
    lt: set('true false'), ty: set(''), bi: set('echo printf read cd ls pwd mkdir rm cp mv cat grep sed awk find chmod chown source test exit sort uniq wc head tail cut xargs curl tr tee date sleep seq'),
    line: ['#'], strings: ['"', "'"], dollarVar: true, hashNeedsSpace: true };
  L.json = { kw: set(''), lt: set('true false null'), ty: set(''), bi: set(''), strings: ['"'] };
  L.plain = { kw: set(''), lt: set(''), ty: set(''), bi: set(''), strings: [] };
  var ALIAS = { js: 'javascript', ts: 'typescript', py: 'python', sh: 'bash', shell: 'bash', 'c++': 'cpp', cs: 'csharp', text: 'plain', txt: 'plain' };

  var NUM = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|0[oO][0-7_]+|(?:\d[\d_]*\.?[\d_]*|\.\d+)(?:[eE][+-]?\d+)?)[a-zA-Z]*/;

  function hlCode(code, c) {
    var out = '', i = 0, n = code.length, m;
    outer: while (i < n) {
      var ch = code[i], rest;
      var prev = i > 0 ? code[i - 1] : '\n';
      // 주석(블록)
      if (c.block) for (var b = 0; b < c.block.length; b++) {
        var bs = c.block[b][0], be = c.block[b][1];
        if (code.startsWith(bs, i)) {
          var j = code.indexOf(be, i + bs.length); j = j < 0 ? n : j + be.length;
          out += sp('cm', code.slice(i, j)); i = j; continue outer;
        }
      }
      // 주석(한 줄)
      if (c.line) for (var k = 0; k < c.line.length; k++) {
        var lc = c.line[k];
        if (code.startsWith(lc, i)) {
          if (lc === '#' && c.hashNeedsSpace && !/\s/.test(prev)) break;
          if (lc === '#' && c.phpTag && code[i + 1] === '[') break;
          var e = code.indexOf('\n', i); e = e < 0 ? n : e;
          out += sp('cm', code.slice(i, e)); i = e; continue outer;
        }
      }
      // 전처리기 (#include, #define)
      if (c.pp && ch === '#') {
        var ls = code.lastIndexOf('\n', i - 1) + 1;
        if (/^\s*$/.test(code.slice(ls, i))) {
          var pe = code.indexOf('\n', i); pe = pe < 0 ? n : pe;
          out += sp('mt', code.slice(i, pe)); i = pe; continue;
        }
      }
      if (c.phpTag && (code.startsWith('<?php', i) || code.startsWith('?>', i))) {
        var t = code.startsWith('<?php', i) ? '<?php' : '?>'; out += sp('mt', t); i += t.length; continue;
      }
      // 러스트 속성 #[derive(...)]
      if (c.attr && ch === '#' && (code[i + 1] === '[' || (code[i + 1] === '!' && code[i + 2] === '['))) {
        var ae = code.indexOf(']', i); ae = ae < 0 ? n : ae + 1; out += sp('mt', code.slice(i, ae)); i = ae; continue;
      }
      // 문자열
      if (c.rustChar && ch === "'") {
        m = /^'(?:\\.[^']*|[^'\\])'/.exec(code.slice(i, i + 12));
        if (m) { out += sp('st', m[0]); i += m[0].length; continue; }
        m = /^'[A-Za-z_]\w*/.exec(code.slice(i)); if (m) { out += sp('mt', m[0]); i += m[0].length; continue; }
      }
      for (var s = 0; s < c.strings.length; s++) {
        var d = c.strings[s];
        if (code.startsWith(d, i)) {
          var multi = d.length === 3 || d === '`', j2 = i + d.length;
          var raw = d === '`' && c.rawBacktick;
          while (j2 < n) {
            if (!raw && code[j2] === '\\') { j2 += 2; continue; }
            if (code.startsWith(d, j2)) { j2 += d.length; break; }
            if (!multi && code[j2] === '\n') break;
            j2++;
          }
          if (j2 > n) j2 = n;
          out += sp('st', code.slice(i, j2)); i = j2; continue outer;
        }
      }
      // 변수 ($var)
      if (c.dollarVar && ch === '$') {
        m = /^\$(?:\{[^}\n]*\}|\(\(?|[A-Za-z_]\w*|[0-9#@?*!$])/.exec(code.slice(i, i + 80));
        if (m) { out += sp('va', m[0]); i += m[0].length; continue; }
      }
      if (c.ivar && ch === '@') {
        m = /^@@?[A-Za-z_]\w*/.exec(code.slice(i, i + 60)); if (m) { out += sp('va', m[0]); i += m[0].length; continue; }
      }
      if (c.symbols && ch === ':' && /[A-Za-z_]/.test(code[i + 1] || '') && prev !== ':' && !/\w/.test(prev)) {
        m = /^:[A-Za-z_]\w*[?!]?/.exec(code.slice(i, i + 60)); out += sp('lt', m[0]); i += m[0].length; continue;
      }
      // 데코레이터/어노테이션
      if (c.deco && ch === '@') {
        m = /^@[A-Za-z_][\w.]*/.exec(code.slice(i, i + 80)); if (m) { out += sp('mt', m[0]); i += m[0].length; continue; }
      }
      // 숫자
      if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(code[i + 1] || '') && !/\w/.test(prev))) {
        if (!/[\w$]/.test(prev)) {
          m = NUM.exec(code.slice(i, i + 64));
          if (m) { out += sp('nu', m[0]); i += m[0].length; continue; }
        }
      }
      // 식별자
      var idRe = c.dollarIdent ? /^[A-Za-z_$][\w$]*/ : (c.dotIdent ? /^[A-Za-z_.][\w.]*/ : /^[A-Za-z_][\w]*[?]?/);
      if (/[A-Za-z_$.]/.test(ch) && (ch !== '.' || c.dotIdent) && (ch !== '$' || c.dollarIdent)) {
        m = idRe.exec(code.slice(i, i + 120));
        if (m) {
          var w = m[0]; if (w[w.length - 1] === '?') w = w.slice(0, -1);
          if (c.strPrefix && w.length <= 2 && /^[rbfuRBFU@$]+$/.test(w) && /["']/.test(code[i + w.length] || '')) { out += sp('st', w); i += w.length; continue; }
          var key = c.ci ? w.toLowerCase() : w, after = code.slice(i + w.length, i + w.length + 2);
          var cls = null;
          if (c.kw[key]) cls = 'kw';
          else if (c.lt[key]) cls = 'lt';
          else if (c.ty[key]) cls = 'ty';
          else if (c.macro && after[0] === '!' && after[1] !== '=') { cls = 'fn'; w += '!'; }
          else if (c.bi[key]) cls = 'bi';
          else if (/^\s*\(/.test(code.slice(i + w.length, i + w.length + 3))) cls = 'fn';
          else if (c.capType && /^[A-Z][a-z0-9]/.test(w)) cls = 'ty';
          out += cls ? sp(cls, w) : esc(w); i += w.length; continue;
        }
      }
      out += esc(ch); i++;
    }
    return out;
  }

  function hlCSS(code) {
    var out = '', i = 0, n = code.length;
    while (i < n) {
      var ch = code[i];
      if (/\s/.test(ch)) { out += ch; i++; continue; }
      if (code.startsWith('/*', i)) { var e = code.indexOf('*/', i + 2); e = e < 0 ? n : e + 2; out += sp('cm', code.slice(i, e)); i = e; continue; }
      if (ch === '{' || ch === '}' || ch === ';') { out += ch; i++; continue; }
      // 세그먼트: 다음 { ; } 또는 주석까지
      var j = i, q = null;
      while (j < n) {
        var cj = code[j];
        if (q) { if (cj === q) q = null; j++; continue; }
        if (cj === '"' || cj === "'") { q = cj; j++; continue; }
        if (cj === '{' || cj === ';' || cj === '}' || code.startsWith('/*', j)) break;
        j++;
      }
      var seg = code.slice(i, j), term = code[j];
      if (term === '{') {
        var mm = /^(@[\w-]+)([\s\S]*)$/.exec(seg);
        out += mm ? sp('kw', mm[1]) + cssValue(mm[2]) : sp('sl', seg);
      } else {
        var ci = seg.indexOf(':');
        if (ci > 0 && !/^@/.test(seg)) out += sp('pr', seg.slice(0, ci)) + ':' + cssValue(seg.slice(ci + 1));
        else if (/^@/.test(seg)) { var m2 = /^(@[\w-]+)([\s\S]*)$/.exec(seg); out += sp('kw', m2[1]) + cssValue(m2[2]); }
        else out += esc(seg);
      }
      i = j;
    }
    return out;
  }
  function cssValue(v) {
    return v.replace(/("[^"]*"|'[^']*')|(#[0-9a-fA-F]{3,8}\b)|(!important)|(-?\d*\.?\d+(?:px|em|rem|%|s|ms|vh|vw|fr|deg|ch|vmin|vmax)?)|([a-zA-Z-]+(?=\())|([^"'#!\d\-a-zA-Z]+|[\s\S])/g, function (all, st, hex, imp, num, fn, other) {
      if (st) return sp('st', st); if (hex) return sp('nu', hex); if (imp) return sp('kw', imp);
      if (num) return sp('nu', num); if (fn) return sp('fn', fn); return esc(all);
    });
  }

  function hlHTML(code) {
    var re = /<!--[\s\S]*?-->|<!DOCTYPE[^>]*>|<\/?[A-Za-z][\w-]*(?:\s+[^\s=>\/]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+))?)*\s*\/?>/gi;
    var out = '', last = 0, m;
    while ((m = re.exec(code))) {
      out += esc(code.slice(last, m.index));
      var tok = m[0];
      if (tok.startsWith('<!--')) out += sp('cm', tok);
      else if (/^<!DOCTYPE/i.test(tok)) out += sp('mt', tok);
      else {
        var tm = /^(<\/?)([\w-]+)([\s\S]*?)(\/?>)$/.exec(tok);
        out += esc(tm[1]) + sp('tg', tm[2]) + tm[3].replace(/([^\s=]+)(\s*=\s*)?("[^"]*"|'[^']*'|[^\s>]+)?/g, function (a, name, eq, val) {
          return sp('at', name) + (eq ? esc(eq) : '') + (val ? sp('st', val) : '');
        }) + esc(tm[4]);
        var tag = tm[2].toLowerCase();
        if (tm[1] === '<' && (tag === 'style' || tag === 'script')) {
          var close = code.toLowerCase().indexOf('</' + tag, re.lastIndex);
          if (close < 0) close = code.length;
          var inner = code.slice(re.lastIndex, close);
          out += tag === 'style' ? hlCSS(inner) : hlCode(inner, L.javascript);
          re.lastIndex = close; last = close; continue;
        }
      }
      last = re.lastIndex;
    }
    return out + esc(code.slice(last));
  }

  window.highlightCode = function (code, lang) {
    lang = (lang || 'plain').toLowerCase(); lang = ALIAS[lang] || lang;
    try {
      if (lang === 'html' || lang === 'xml' || lang === 'htmlcss') return hlHTML(code);
      if (lang === 'css') return hlCSS(code);
      return hlCode(code, L[lang] || L.plain);
    } catch (e) { return esc(code); }
  };
  window.highlightLangName = function (lang) {
    var names = { python: 'Python', javascript: 'JavaScript', typescript: 'TypeScript', java: 'Java', c: 'C', cpp: 'C++', csharp: 'C#', go: 'Go', rust: 'Rust', php: 'PHP', sql: 'SQL', bash: 'Bash', html: 'HTML', css: 'CSS', json: 'JSON', plain: '텍스트' };
    lang = (lang || '').toLowerCase(); return names[ALIAS[lang] || lang] || lang;
  };
})();
