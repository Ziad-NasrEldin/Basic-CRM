'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import enTranslations from './translations/en.json';
import arTranslations from './translations/ar.json';

const TranslationContext = createContext();

export function TranslationProvider({ children }) {
  const [language, setLanguage] = useState('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = typeof window !== 'undefined' ? localStorage.getItem('preferredLanguage') : 'en';
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.dir = savedLanguage === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = savedLanguage;
      document.documentElement.style.fontFamily = savedLanguage === 'ar' ? '"Cairo", sans-serif' : '"Josefin Sans", sans-serif';
    }
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLanguage = language === 'en' ? 'ar' : 'en';
    setLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
    document.documentElement.dir = newLanguage === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLanguage;
    document.documentElement.style.fontFamily = newLanguage === 'ar' ? '"Cairo", sans-serif' : '"Josefin Sans", sans-serif';
  };

  const translations = language === 'ar' ? arTranslations : enTranslations;
  const dir = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <TranslationContext.Provider value={{ language, toggleLanguage, translations, dir, mounted }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
