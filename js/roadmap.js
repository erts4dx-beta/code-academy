/* 추천 학습 로드맵 (트랙별 순서) */
CA.categories = ['전체', '웹', '범용', '시스템', '데이터', '스크립트'];
CA.levelDesc = {
  '입문': '설치, 첫 프로그램, 변수와 자료형',
  '초급': '조건문, 반복문, 함수, 기본 자료구조',
  '중급': '객체지향/모듈, 에러 처리, 컬렉션 활용',
  '고급': '동시성, 제네릭, 메모리, 실전 패턴'
};
CA.roadmap = [
  { id: 'beginner', icon: '🌱', title: '완전 처음이라면', desc: '프로그래밍 자체가 처음인 분을 위한 가장 부드러운 경로입니다.',
    steps: [
      { lang: 'python', focus: '입문~초급: 변수, 조건문, 반복문, 함수로 "생각을 코드로 옮기는" 감각 익히기' },
      { lang: 'htmlcss', focus: '입문~초급: 눈에 보이는 결과물(웹 페이지)을 만들며 흥미 유지' },
      { lang: 'javascript', focus: '입문~중급: 웹 페이지에 동작을 붙이며 두 번째 언어 경험' },
      { lang: 'sql', focus: '입문~초급: 데이터를 꺼내고 정리하는 기본기' }
    ] },
  { id: 'frontend', icon: '🎨', title: '웹 프론트엔드', desc: '브라우저에서 동작하는 화면과 상호작용을 만드는 개발자 경로입니다.',
    steps: [
      { lang: 'htmlcss', focus: '시맨틱 마크업, Flexbox/Grid, 반응형 디자인' },
      { lang: 'javascript', focus: 'DOM, 이벤트, 비동기(Promise/async), 모듈' },
      { lang: 'typescript', focus: '타입 시스템, 제네릭, 대규모 코드베이스 관리 — 이후 React/Vue 같은 프레임워크 학습의 기반' }
    ] },
  { id: 'backend', icon: '🖥️', title: '백엔드 / 서버', desc: 'API, 데이터베이스, 인증 등 서비스의 뒤편을 책임지는 경로입니다.',
    steps: [
      { lang: 'python', focus: '언어 기본기 + 중급(클래스, 예외, 모듈). 또는 JavaScript(Node.js)로 대체 가능' },
      { lang: 'sql', focus: 'JOIN, 집계, 인덱스, 트랜잭션 — 백엔드의 핵심 역량' },
      { lang: 'java', focus: '엔터프라이즈 표준(Spring). 대안: C#(ASP.NET Core)' },
      { lang: 'go', focus: '고성능 API 서버와 동시성(goroutine)' },
      { lang: 'bash', focus: '서버 운영, 배포 스크립트, 로그 분석' }
    ] },
  { id: 'systems', icon: '⚙️', title: '시스템 / 임베디드', desc: '운영체제, 드라이버, 게임 엔진처럼 하드웨어에 가까운 소프트웨어를 다룹니다.',
    steps: [
      { lang: 'c', focus: '포인터, 메모리 관리, 구조체 — 컴퓨터가 동작하는 방식 이해' },
      { lang: 'cpp', focus: 'RAII, 템플릿, STL, 스마트 포인터' },
      { lang: 'rust', focus: '소유권과 빌림으로 안전한 시스템 프로그래밍' },
      { lang: 'bash', focus: '빌드/자동화, 리눅스 환경 다루기' }
    ] },
  { id: 'data', icon: '📊', title: '데이터 / AI', desc: '데이터 분석, 머신러닝, 데이터 엔지니어링을 위한 경로입니다.',
    steps: [
      { lang: 'python', focus: '전 레벨: 컴프리헨션, 제너레이터, 이후 NumPy/pandas로 확장' },
      { lang: 'sql', focus: '집계, 윈도 함수, 서브쿼리로 데이터 추출' },
      { lang: 'bash', focus: 'grep·awk·파이프로 대용량 로그/CSV 전처리와 작업 자동화' }
    ] },
  { id: 'game', icon: '🎮', title: '게임 개발', desc: '대표 게임 엔진(Unity, Unreal)의 언어를 익히는 경로입니다.',
    steps: [
      { lang: 'csharp', focus: 'Unity 엔진의 스크립팅 언어. 클래스, 이벤트, LINQ' },
      { lang: 'cpp', focus: 'Unreal 엔진과 고성능 게임 코드. 메모리와 성능 최적화' }
    ] },
  { id: 'devops', icon: '☁️', title: 'DevOps / 클라우드', desc: '인프라 자동화, CI/CD, 클라우드 운영을 위한 경로입니다.',
    steps: [
      { lang: 'bash', focus: '파이프, 리다이렉션, 스크립트 자동화' },
      { lang: 'python', focus: '자동화 스크립트, API 연동' },
      { lang: 'go', focus: 'Docker·Kubernetes 생태계의 언어, CLI 도구와 서버 제작' }
    ] },
  { id: 'fullstack', icon: '🧩', title: '풀스택 웹 (PHP)', desc: '빠르게 웹 서비스를 완성하는 전통적인 풀스택 경로입니다.',
    steps: [
      { lang: 'htmlcss', focus: '화면 구성' },
      { lang: 'javascript', focus: '화면 상호작용과 비동기 요청(fetch)' },
      { lang: 'php', focus: '폼 처리, PDO, Laravel / WordPress 생태계' },
      { lang: 'sql', focus: '데이터 모델링과 쿼리' }
    ] }
];
