import React from 'react';
import { Currency } from '../types';
import { formatCurrency } from '../utils/currencies';

interface CostSummaryProps {
  shipping: number;
  insurance: number;
  total: number;
  currency: Currency;
  translations: any;
}

const CostSummary: React.FC<CostSummaryProps> = ({ shipping, insurance, total, currency, translations }) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-800 mb-4">
        {translations.totalCost}
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">{translations.shipping}:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(shipping, currency)}</span>
        </div>
        
        {insurance > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-gray-700">{translations.insuranceFee}:</span>
            <span className="font-semibold text-gray-900">{formatCurrency(insurance, currency)}</span>
          </div>
        )}
        
        <div className="border-t border-purple-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-purple-800">Total:</span>
            <span className="text-2xl font-bold text-purple-800">{formatCurrency(total, currency)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostSummary;