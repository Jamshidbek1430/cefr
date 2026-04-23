import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import uzCommon from '../public/locales/uz/common.json';
import trCommon from '../public/locales/tr/common.json';
import ruCommon from '../public/locales/ru/common.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'uz',
    defaultNS: 'common',
    supportedLngs: ['uz', 'tr', 'ru'],
    resources: {
      uz: { common: uzCommon },
      tr: { common: trCommon },
      ru: { common: ruCommon },
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

export default i18n;
