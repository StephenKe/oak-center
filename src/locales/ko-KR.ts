import component from './ko-KR/component';
import globalHeader from './ko-KR/globalHeader';
import menu from './ko-KR/menu';
import pages from './ko-KR/pages';
import pwa from './ko-KR/pwa';
import settingDrawer from './ko-KR/settingDrawer';
import settings from './ko-KR/settings';

export default {
  'navBar.lang': '언어 문자',
  'layout.user.link.help': '돕다',
  'layout.user.link.privacy': '프라이버시',
  'layout.user.link.terms': '조항',
  'app.copyright.produced': '개미 금융 체험부 제작',
  'app.preview.down.block': '이 페이지를 로컬 항목으로 다운로드',
  'app.welcome.link.fetch-blocks': '모든 블록 가져오기',
  'app.welcome.link.block-list': '블록 기반 빠른 표준 페이지 구축',
  ...globalHeader,
  ...menu,
  ...settingDrawer,
  ...settings,
  ...pwa,
  ...component,
  ...pages,
};
