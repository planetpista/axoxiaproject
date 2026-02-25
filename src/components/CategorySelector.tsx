import React from 'react';
import { Package, Mail, Container } from 'lucide-react';

interface CategorySelectorProps {
  value: string;
  onChange: (category: 'Mail' | 'Parcel' | 'Container') => void;
  translations: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange, translations }) => {
  const categories = [
    { id: 'Mail', icon: Mail, key: 'mail' },
    { id: 'Parcel', icon: Package, key: 'parcel' },
    { id: 'Container', icon: Container, key: 'container' }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {categories.map(({ id, icon: Icon, key }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id as 'Mail' | 'Parcel' | 'Container')}
          className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 ${
            value === id
              ? 'border-purple-500 bg-purple-50 text-purple-700'
              : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
          }`}
        >
          <Icon size={32} className="mb-2" />
          <span className="font-medium">{translations[key]}</span>
        </button>
      ))}
    </div>
  );
};

export default CategorySelector;