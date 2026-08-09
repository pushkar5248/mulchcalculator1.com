import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  // With build.format: 'file' the locale index is emitted as e.g. /es.html
  const pathname = url.pathname.replace(/\.html$/, '').replace(/\/index$/, '/');
  const [, lang] = pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
