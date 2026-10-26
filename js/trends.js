/* 트렌드 중요도 데이터 (단일 출처)
 * - 언어 카드의 "✓ 트렌드 중요도" 토글이 이 파일의 값을 사용합니다.
 * - 주간 점검 시: asOf / sources / signals 수치만 최신 자료로 갱신하면 별점이 자동으로 다시 계산됩니다.
 *   (reason 문구도 수치에 맞게 함께 고쳐 주세요.)
 * - 계산 방식: 신호별로 13개 언어 안에서 순위 백분위(1위=1, 꼴찌=0, 동점은 평균 순위)를 구하고,
 *   가중 평균(자료가 없는 신호는 제외 후 가중치 재정규화) → 1위 언어 점수 대비 비율로 1~5점 환산, 0.5 단위 반올림.
 */
CA.trends = {
  asOf: '2026년 10월 기준',
  updated: '2026-10-26',
  sources: [
    { id: 'soUsed', name: 'Stack Overflow 개발자 설문 2026 — 사용 언어', date: '2026-10-06 발표 (응답 14,099명)', url: 'https://survey.stackoverflow.co/2026/technology/data/languages' },
    { id: 'soDA', name: 'Stack Overflow 개발자 설문 2026 — 희망(Desired)·존중(Admired)', date: '2026-10-06 발표', url: 'https://survey.stackoverflow.co/2026/technology/data/da-language' },
    { id: 'soPrev', name: 'Stack Overflow 개발자 설문 2025 — 사용 언어 (전년 대비 변화 계산용)', date: '2025년 발표', url: 'https://survey.stackoverflow.co/2025/technology' },
    { id: 'tiobe', name: 'TIOBE Index 2026년 10월', date: '2026-10 (월간)', url: 'https://www.tiobe.com/tiobe-index/' },
    { id: 'jobs', name: 'Oxylabs·Coresignal 미국 채용공고 80만+ 건 분석', date: '2026-05-28 발표 (2025.1~2026.3 공고)', url: 'https://oxylabs.io/press-area/most-in-demand-programming-languages' },
    { id: 'octo', name: 'GitHub Octoverse 2025', date: '2025-10-28 발표 (2024.8~2025.8 데이터)', url: 'https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/' }
  ],
  /* 신호 정의와 가중치(합계 1). key 는 signals 의 필드명 */
  weights: [
    { key: 'jobs', w: 0.25, label: '채용공고 언급 비율(%)' },
    { key: 'used', w: 0.20, label: 'SO 2026 사용률(%)' },
    { key: 'desired', w: 0.15, label: 'SO 2026 희망률(%)' },
    { key: 'octo', w: 0.15, label: 'GitHub Octoverse 2025 성장 등급(0~1)' },
    { key: 'tiobe', w: 0.10, label: 'TIOBE 2026.10 점유율(%)' },
    { key: 'momentum', w: 0.10, label: 'SO 사용률 전년 대비 변화(%p)' },
    { key: 'admired', w: 0.05, label: 'SO 2026 존중도(%)' }
  ],
  /* octo 등급: 1.0 = 기여자 수·성장 최상위(TypeScript 1위 +66%, Python 2위 +48%), 0.8 = 3위, 0.6 = 성장 상위 5 (Java·C#),
     0.5 = 신규 저장소 핵심 6개 언어(C++), 0.4 = 보조 신호(셸 스크립트 AI 저장소 +324%, CSS 신규 기여자 유입), 0.2 = 별도 언급 없음, null = 집계 대상 아님
     jobs: 상위 10위 밖(<5%)은 3 으로 처리, HTML/CSS 는 분석 제외(null). tiobe: Bash 는 51~100위(<0.25%)라 0.2 로 처리, HTML/CSS 는 미집계(null) */
  signals: {
    python:     { used: 58.0, desired: 33.4, admired: 50.6, momentum: 0.1,  tiobe: 19.23, jobs: 46,   octo: 1.0 },
    javascript: { used: 62.0, desired: 27.8, admired: 42.0, momentum: -4.0, tiobe: 2.77,  jobs: 19,   octo: 0.8 },
    typescript: { used: 43.8, desired: 27.5, admired: 53.0, momentum: 0.2,  tiobe: 0.41,  jobs: 8,    octo: 1.0 },
    htmlcss:    { used: 58.2, desired: 29.0, admired: 47.8, momentum: -3.7, tiobe: null,  jobs: null, octo: 0.4 },
    java:       { used: 27.6, desired: 13.1, admired: 38.5, momentum: -1.8, tiobe: 8.41,  jobs: 21,   octo: 0.6 },
    c:          { used: 21.8, desired: 14.2, admired: 45.9, momentum: -0.2, tiobe: 11.33, jobs: 3,    octo: 0.2 },
    cpp:        { used: 24.3, desired: 15.8, admired: 45.8, momentum: 0.8,  tiobe: 8.87,  jobs: 11,   octo: 0.5 },
    csharp:     { used: 27.1, desired: 16.5, admired: 50.0, momentum: -0.7, tiobe: 3.79,  jobs: 9,    octo: 0.6 },
    go:         { used: 16.5, desired: 17.7, admired: 49.5, momentum: 0.1,  tiobe: 1.39,  jobs: 5,    octo: 0.2 },
    rust:       { used: 18.0, desired: 26.3, admired: 67.4, momentum: 3.1,  tiobe: 1.44,  jobs: 3,    octo: 0.2 },
    php:        { used: 17.7, desired: 7.6,  admired: 35.7, momentum: -1.1, tiobe: 1.26,  jobs: 3,    octo: 0.2 },
    sql:        { used: 58.4, desired: 32.0, admired: 51.4, momentum: -0.2, tiobe: 1.97,  jobs: 45,   octo: null },
    bash:       { used: 51.3, desired: 25.8, admired: 48.1, momentum: 2.6,  tiobe: 0.2,   jobs: 11,   octo: 0.4 }
  },
  reasons: {
    python: 'SO 희망률 1위(33%)·TIOBE 1위(19.2%)·채용공고 46%로 1위 — AI·데이터 시대의 핵심 언어',
    sql: '채용공고 45%로 Python과 거의 동률, SO 사용률 58%·희망률 2위 — 거의 모든 직군의 필수 동반 기술',
    javascript: 'SO 사용률 1위(62%)·채용 19% — 웹의 필수 언어지만 신규 프로젝트는 TypeScript로 이동 중(사용률 −4%p)',
    htmlcss: 'SO 사용률 58%·희망률 29% — 웹의 기본기 (채용·TIOBE 통계는 마크업이라 집계 제외)',
    typescript: 'GitHub 기여자 수 1위(2025.8, +66%)·존중도 53% — 다만 채용공고 비중 8%, TIOBE 38위로 아직 격차',
    bash: 'SO 사용률 51%(+2.6%p)·채용 11%·AI 저장소 셸 스크립트 +324% — 자동화·DevOps 기본기',
    java: 'TIOBE 4위·채용공고 21%(3위) — 엔터프라이즈 백엔드 수요는 꾸준하나 희망률은 낮음(13%)',
    cpp: 'TIOBE 3위·채용 11%·사용률 +0.8%p — 게임·AI 추론·임베디드의 성능 핵심',
    csharp: 'TIOBE 5위·채용 9%·GitHub 성장 5위(+22%) — .NET·Unity 생태계가 견조',
    rust: 'SO 존중도 1위(67%)·사용률 +3.1%p로 가장 가파른 성장, TIOBE 10위 — 채용 규모는 아직 작음(<5%)',
    c: 'TIOBE 2위(11.3%)지만 채용공고 비중 3%·희망률 14% — 시스템·임베디드 기초 지식으로서 가치',
    go: 'SO 존중도 50%이나 TIOBE 11위(전년 8위)·채용 5% — 클라우드·인프라 분야 특화 수요',
    php: 'SO 희망률 7.6%·존중도 36%로 최하위권, TIOBE 12위 — 기존 웹(WordPress·Laravel) 유지보수 중심'
  }
};
/* 별점 계산 (데이터만 바꾸면 자동 반영) */
(function (T) {
  var ids = Object.keys(T.signals), raw = {};
  ids.forEach(function (id) { raw[id] = 0; });
  var pct = {};
  T.weights.forEach(function (wt) {
    var vals = ids.filter(function (id) { return T.signals[id][wt.key] != null; }).map(function (id) { return T.signals[id][wt.key]; });
    var n = vals.length; pct[wt.key] = {};
    ids.forEach(function (id) {
      var v = T.signals[id][wt.key]; if (v == null) return;
      var better = vals.filter(function (x) { return x > v; }).length, eq = vals.filter(function (x) { return x === v; }).length;
      pct[wt.key][id] = n > 1 ? 1 - (better + (eq - 1) / 2) / (n - 1) : 1;
    });
  });
  var top = 0;
  ids.forEach(function (id) {
    var num = 0, den = 0;
    T.weights.forEach(function (wt) { if (pct[wt.key][id] != null) { num += wt.w * pct[wt.key][id]; den += wt.w; } });
    raw[id] = den ? num / den : 0; if (raw[id] > top) top = raw[id];
  });
  T.score = raw;
  T.stars = {};
  ids.forEach(function (id) { T.stars[id] = Math.max(1, Math.min(5, Math.round((1 + 4 * raw[id] / (top || 1)) * 2) / 2)); });
  T.levelName = function (s) { return s >= 4.5 ? '매우 높음' : s >= 3.5 ? '높음' : s >= 2.5 ? '보통' : s >= 1.5 ? '낮음' : '매우 낮음'; };
})(CA.trends);
