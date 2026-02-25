import { Currency } from '../types';

export const currencies: Currency[] = [
  {
    code: 'EUR',
    symbol: '€',
    name: 'Euro',
    rate: 1
  },
  {
    code: 'XOF',
    symbol: 'CFA',
    name: 'West African CFA Franc',
    rate: 655.957 // 1 EUR = 655.957 XOF (approximate)
  },
  {
    code: 'CNY',
    symbol: '¥',
    name: 'Chinese Yuan',
    rate: 7.85 // 1 EUR = 7.85 CNY (approximate)
  }
];

export const convertCurrency = (amount: number, fromCurrency: Currency, toCurrency: Currency): number => {
  // Convert to EUR first, then to target currency
  const eurAmount = amount / fromCurrency.rate;
  return eurAmount * toCurrency.rate;
};

export const formatCurrency = (amount: number, currency: Currency): string => {
  return `${currency.symbol}${amount.toFixed(2)}`;
};