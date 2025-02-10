import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    debug: true,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        translation: require('./locales/en/translation.json'),
      },
      tr: {
        translation: require('./locales/tr/translation.json'),
      },
      // Add more languages as needed
    },
  });

export default i18n;