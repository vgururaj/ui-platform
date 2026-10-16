/** NANP: 10 digits, or 11 with leading country code 1. Area/exchange cannot start with 0 or 1. */
export function isUsPhoneNumber(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  const national = digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
  if (national.length !== 10) return false;
  return national[0] !== '0' && national[0] !== '1' && national[3] !== '0' && national[3] !== '1';
}

export function phoneFieldError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return isUsPhoneNumber(trimmed) ? null : 'Enter a valid US phone number (10 digits).';
}

export function emailFieldError(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  // Practical check aligned with typical form validation (not full RFC).
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Enter a valid email address.';
  return null;
}
