export interface WaitlistSignupRequest {
  email: string;
  website?: string;
}

export const WAITLIST_ENDPOINT = '/api/waitlist';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWaitlistEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isValidWaitlistEmail(email: string): boolean {
  const normalizedEmail = normalizeWaitlistEmail(email);

  return (
    normalizedEmail.length > 0 &&
    normalizedEmail.length <= 254 &&
    EMAIL_PATTERN.test(normalizedEmail)
  );
}
