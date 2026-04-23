'use client';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/i18n';

const languages = [
  { code: 'uz', label: "O'Z", flag: '🇺🇿' },
  { code: 'tr', label: 'TR', flag: '🇹🇷' },
  { code: 'ru', label: 'RU', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [current, setCurrent] = useState('uz');

  useEffect(() => {
    const saved = localStorage.getItem('i18nextLng') || 'uz';
    setCurrent(saved);
    i18n.changeLanguage(saved);
  }, [i18n]);

  const changeLanguage = async (code: string) => {
    await i18n.changeLanguage(code);
    localStorage.setItem('i18nextLng', code);
    setCurrent(code);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
      {languages.map((lang) => {
        const isActive = current === lang.code;
        const buttonClass = isActive
          ? 'flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-all bg-[#8B1E2D] text-white'
          : 'flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-all text-gray-400 hover:text-white';
        
        return (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={buttonClass}
          >
            <span>{lang.flag}</span>
            <span>{lang.label}</span>
          </button>
        );
      })}
    </div>
  );
}
