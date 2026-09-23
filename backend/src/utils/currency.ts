/**
 * Format currency amount based on currency code and locale symbol.
 * Does NOT fabricate exchange rates or mock conversion numbers.
 */
export const formatCurrency = (
  amount: number | null | undefined,
  currencyCode: string = 'INR',
  currencySymbol: string = '₹'
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return 'Price Not Available';
  }

  try {
    const formatted = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2
    }).format(amount);

    return `${currencySymbol}${formatted}`;
  } catch {
    return `${currencySymbol}${amount}`;
  }
};
