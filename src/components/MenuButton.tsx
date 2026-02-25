import React from 'react';
import { Menu } from 'lucide-react';

interface MenuButtonProps {
  onClick: () => void;
  translations: any;
}

const MenuButton: React.FC<MenuButtonProps> = ({ onClick, translations }) => {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200 shadow-sm"
    >
      <Menu size={18} className="text-purple-600" />
      <span className="text-purple-700 font-medium">{translations.menu}</span>
    </button>
  );
};

export default MenuButton;