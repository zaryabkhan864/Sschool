import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = ()=> {
  const { i18n } = useTranslation();
  const [isEnglish, setIsEnglish] = React.useState(true);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const handleToggle = () => {
    const newLang = isEnglish ? 'tr' : 'en';
    changeLanguage(newLang);
    setIsEnglish(!isEnglish);
  };

  return (
    <div className="flex items-center">
      <span className="mr-2 text-lg text-gray-800">{isEnglish ? 'English' : 'Türkçe'}</span>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={isEnglish} onChange={handleToggle} className="sr-only" />
        <div className="w-10 h-6 bg-blue-200 rounded-full shadow-inner"></div>
        <div className={`absolute w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${isEnglish ? 'translate-x-1' : 'translate-x-5'}`}></div>
      </label>
    </div>
  );
}

export default LanguageSwitcher;