import React from 'react';

interface PersonInfo {
  address: string;
  firstName: string;
  lastName: string;
  contact: string;
  email: string;
}

interface PersonInfoFormProps {
  data: PersonInfo;
  onChange: (data: PersonInfo) => void;
  translations: any;
}

const PersonInfoForm: React.FC<PersonInfoFormProps> = ({ data, onChange, translations }) => {
  const updateField = (field: keyof PersonInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.address}
        </label>
        <input
          type="text"
          value={data.address}
          onChange={(e) => updateField('address', e.target.value)}
          placeholder={translations.addressPlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.firstName}
        </label>
        <input
          type="text"
          value={data.firstName}
          onChange={(e) => updateField('firstName', e.target.value)}
          placeholder={translations.firstNamePlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.lastName}
        </label>
        <input
          type="text"
          value={data.lastName}
          onChange={(e) => updateField('lastName', e.target.value)}
          placeholder={translations.lastNamePlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.contact}
        </label>
        <input
          type="tel"
          value={data.contact}
          onChange={(e) => updateField('contact', e.target.value)}
          placeholder={translations.contactPlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {translations.email}
        </label>
        <input
          type="email"
          value={data.email}
          onChange={(e) => updateField('email', e.target.value)}
          placeholder={translations.emailPlaceholder}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200"
        />
      </div>
    </div>
  );
};

export default PersonInfoForm;