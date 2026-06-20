/** GA4 Measurement ID (inlined at build time via NEXT_PUBLIC_ prefix). */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID?.trim() ?? "";

const GA4_ID_PATTERN = /^G-[A-Z0-9]{6,}$/i;

export function isValidGaMeasurementId(id: string): boolean {
  return GA4_ID_PATTERN.test(id);
}

/** Returns a validated GA4 ID, or null if missing/invalid. */
export function getGaMeasurementId(): string | null {
  if (!GA_MEASUREMENT_ID) return null;
  return isValidGaMeasurementId(GA_MEASUREMENT_ID) ? GA_MEASUREMENT_ID : null;
}
