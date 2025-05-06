import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'tr' | 'en';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  getLanguageName: (lang: Language) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

const languageNames = {
  tr: 'Türkçe',
  en: 'English',
};

export const LanguageProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>('tr');

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage && (savedLanguage === 'tr' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Dil ayarı yüklenirken hata:', error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await AsyncStorage.setItem('language', lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Dil ayarı kaydedilirken hata:', error);
    }
  };

  const getLanguageName = (lang: Language) => languageNames[lang];

  return (
    <LanguageContext.Provider value={{language, setLanguage, getLanguageName}}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
