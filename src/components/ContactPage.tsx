import React from 'react';
import { ArrowLeft, Mail, Phone, MapPin } from 'lucide-react';

interface ContactPageProps {
  onBack: () => void;
  translations: any;
}

const ContactPage: React.FC<ContactPageProps> = ({ onBack, translations }) => {
  const contactInfo = [
    {
      icon: Mail,
      label: translations.emailAddress,
      value: 'affairsplanet@outlook.com',
      href: 'mailto:affairsplanet@outlook.com'
    },
    {
      icon: Phone,
      label: translations.phoneNumber,
      value: '010101010',
      href: 'tel:010101010'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft size={24} className="text-gray-600" />
            </button>
            <h1 className="text-2xl font-bold text-gray-800">{translations.contactUs}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-800 mb-4">Axoxia</h2>
            <p className="text-gray-600 text-lg">
              {translations.easySimpleFast}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {contactInfo.map((item, index) => (
              <div key={index} className="flex items-center gap-4 p-6 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                    <item.icon size={24} className="text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-800 mb-1">{item.label}</h3>
                  <a
                    href={item.href}
                    className="text-purple-600 hover:text-purple-700 transition-colors duration-200 font-medium"
                  >
                    {item.value}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <MapPin size={24} className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Service Areas</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🇧🇯</div>
                <div className="font-medium text-gray-800">Benin</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🇨🇳</div>
                <div className="font-medium text-gray-800">China</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-gray-200">
                <div className="text-2xl mb-2">🇫🇷</div>
                <div className="font-medium text-gray-800">France</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;