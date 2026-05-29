import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext(null);

const SUPPORTED_LANGS = [
  { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('mp_lang') || 'uz';
  });

  const changeLang = (code) => {
    setLang(code);
    localStorage.setItem('mp_lang', code);
  };

  const t = useCallback((key) => {
    return translations[lang]?.[key] || translations['uz']?.[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, changeLang, t, SUPPORTED_LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
