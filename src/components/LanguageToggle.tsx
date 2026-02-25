import React from 'react';
import { Globe } from 'lucide-react';

interface LanguageToggleProps {
  currentLanguage: 'en' | 'fr';
  onLanguageChange: (language: 'en' | 'fr') => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ currentLanguage, onLanguageChange }) => {
  return (
    <button
      onClick={() => onLanguageChange(currentLanguage === 'en' ? 'fr' : 'en')}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200 shadow-sm"
    >
      <Globe size={18} className="text-purple-600" />
      <span className="text-purple-700 font-medium">
        {currentLanguage === 'en' ? 'FR' : 'EN'}
      </span>
    </button>
  );
};

export default LanguageToggle;