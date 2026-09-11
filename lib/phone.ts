// "555-010-2020" -> "+15550102020". Assumes the default country when there is no + prefix.
export function toE164(phone: string, defaultCountryCode: string): string | null {
  const raw = phone.trim();
  if (raw.startsWith("+")) {
    const d = `+${raw.slice(1).replace(/\D/g, "")}`;
    return /^\+\d{8,15}$/.test(d) ? d : null;
  }
  const digits = raw.replace(/\D/g, "").replace(/^0+/, "");
  const cc = defaultCountryCode.replace(/\D/g, "");
  if (digits.length < 7) return null;
  const full = digits.length > 10 && digits.startsWith(cc) ? digits : cc + digits;
  return /^\d{8,15}$/.test(full) ? `+${full}` : null;
}
