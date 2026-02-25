import { useState, useEffect } from 'react';
import { ShippingData, Currency } from '../types';
import { convertCurrency, currencies } from '../utils/currencies';

export const useShippingCalculator = (shippingData: ShippingData, currency: Currency) => {
  const [costs, setCosts] = useState({
    shipping: 0,
    insurance: 0,
    total: 0
  });

  useEffect(() => {
    const calculateCosts = () => {
      let shippingCost = 0;
      
      if (shippingData.weight > 0) {
        // €10/kg for under 7kg, €8/kg for over 7kg
        const rate = shippingData.weight < 7 ? 10 : 8;
        const eurCost = shippingData.weight * rate;
        shippingCost = convertCurrency(eurCost, currencies[0], currency); // Convert from EUR to selected currency
      }
      
      const insuranceCost = shippingData.insurance ? shippingCost * 0.2 : 0;
      const total = shippingCost + insuranceCost;
      
      setCosts({
        shipping: shippingCost,
        insurance: insuranceCost,
        total
      });
    };

    calculateCosts();
  }, [shippingData.weight, shippingData.insurance, currency]);

  return costs;
};