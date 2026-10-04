/* 전역 네임스페이스: 데이터 스크립트가 여기에 언어를 등록합니다 */
window.CA = {
  languages: [],
  byId: {},
  LEVELS: ['입문', '초급', '중급', '고급'],
  registerLanguage: function (lang) {
    this.languages.push(lang);
    this.byId[lang.id] = lang;
  }
};
