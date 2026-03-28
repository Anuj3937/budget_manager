'use client';

import { useLocale } from 'next-intl';
import { useCallback, useMemo } from 'react';

export function useCurrency() {
  const localeStr = useLocale();

  const config = useMemo(() => {
    const map: Record<string, { locale: string; currency: string; symbol: string }> = {
      'in': { locale: 'en-IN', currency: 'INR', symbol: '₹' },
      'en': { locale: 'en-US', currency: 'USD', symbol: '$' },
      'es': { locale: 'es-ES', currency: 'EUR', symbol: '€' },
    };
    return map[localeStr] || map['en'];
  }, [localeStr]);

  const format = useCallback((amount: number) => {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  }, [config]);

  return { format, ...config };
}
