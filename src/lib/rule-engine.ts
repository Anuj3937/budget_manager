import type { AutoRule } from '@/lib/types';

/**
 * The Rule Engine — A deterministic, zero-cost alternative to AI categorization.
 * Matches user-defined keyword rules against transaction text fields.
 * Runs entirely client-side. No API calls. Scales to millions of users for free.
 */

export function matchRule(
  text: string,
  rules: AutoRule[]
): AutoRule | null {
  if (!text || !rules?.length) return null;

  const normalizedText = text.toLowerCase().trim();

  for (const rule of rules) {
    if (!rule.enabled) continue;

    const keyword = rule.keyword.toLowerCase().trim();

    switch (rule.matchType) {
      case 'exact':
        if (normalizedText === keyword) return rule;
        break;
      case 'startsWith':
        if (normalizedText.startsWith(keyword)) return rule;
        break;
      case 'contains':
      default:
        if (normalizedText.includes(keyword)) return rule;
        break;
    }
  }

  return null;
}

/**
 * Format currency based on locale and currency code.
 * This is our geo-currency formatting utility.
 */
export function formatCurrency(
  amount: number,
  locale: string = 'en-IN',
  currency: string = 'INR'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Get currency code from country code.
 */
export function getCurrencyFromCountry(countryCode: string): { currency: string; locale: string; symbol: string } {
  const map: Record<string, { currency: string; locale: string; symbol: string }> = {
    IN: { currency: 'INR', locale: 'en-IN', symbol: '₹' },
    US: { currency: 'USD', locale: 'en-US', symbol: '$' },
    GB: { currency: 'GBP', locale: 'en-GB', symbol: '£' },
    EU: { currency: 'EUR', locale: 'de-DE', symbol: '€' },
    DE: { currency: 'EUR', locale: 'de-DE', symbol: '€' },
    FR: { currency: 'EUR', locale: 'fr-FR', symbol: '€' },
    ES: { currency: 'EUR', locale: 'es-ES', symbol: '€' },
    JP: { currency: 'JPY', locale: 'ja-JP', symbol: '¥' },
    CN: { currency: 'CNY', locale: 'zh-CN', symbol: '¥' },
    AU: { currency: 'AUD', locale: 'en-AU', symbol: 'A$' },
    CA: { currency: 'CAD', locale: 'en-CA', symbol: 'C$' },
    BR: { currency: 'BRL', locale: 'pt-BR', symbol: 'R$' },
    MX: { currency: 'MXN', locale: 'es-MX', symbol: '$' },
    KR: { currency: 'KRW', locale: 'ko-KR', symbol: '₩' },
    SG: { currency: 'SGD', locale: 'en-SG', symbol: 'S$' },
    AE: { currency: 'AED', locale: 'ar-AE', symbol: 'د.إ' },
    ZA: { currency: 'ZAR', locale: 'en-ZA', symbol: 'R' },
    NG: { currency: 'NGN', locale: 'en-NG', symbol: '₦' },
    SE: { currency: 'SEK', locale: 'sv-SE', symbol: 'kr' },
    NZ: { currency: 'NZD', locale: 'en-NZ', symbol: 'NZ$' },
  };

  return map[countryCode] || map['US'];
}
