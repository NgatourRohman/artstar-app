import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationEN from './locales/en.json';
import translationID from './locales/id.json';

// Ensure the resources follow the shape i18next expects
const resources = {
  en: {
    translation: translationEN
  },
  id: {
    translation: translationID
  }
};

i18n
  // Detects user language from browser settings or localStorage
  .use(LanguageDetector)
  // Passes i18n down to react-i18next
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en', // Fallback to English if undetected
    
    interpolation: {
      escapeValue: false // React already escapes values to prevent XSS
    }
  });

export default i18n;
