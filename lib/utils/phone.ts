export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\.\+\(\)]/g, '').trim()
}

export function phoneToEmail(phone: string): string {
  return `user_${normalizePhone(phone)}@amouris.app`
}
