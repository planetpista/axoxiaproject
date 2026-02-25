import React from 'react';
import { ArrowLeft, Globe } from 'lucide-react';
import { Currency } from '../types';
import { currencies } from '../utils/currencies';

interface SettingsPageProps {
  onBack: () => void;
  currentCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  translations: any;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  onBack, 
  currentCurrency, 
  onCurrencyChange, 
  translations 
}) => {
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
            <h1 className="text-2xl font-bold text-gray-800">{translations.settings}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={24} className="text-purple-600" />
            <h2 className="text-xl font-semibold text-gray-800">{translations.currency}</h2>
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.selectCurrency}
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {currencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => onCurrencyChange(currency)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    currentCurrency.code === currency.code
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">{currency.symbol}</div>
                    <div className="text-sm font-medium">{currency.code}</div>
                    <div className="text-xs text-gray-500">{currency.name}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;