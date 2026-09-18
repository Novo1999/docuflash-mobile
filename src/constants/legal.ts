const LEGAL_SITE_ORIGIN = process.env.EXPO_PUBLIC_SHARE_BASE_URL ?? 'https://docuflash-frontend.vercel.app'

export const PRIVACY_POLICY_URL = `${LEGAL_SITE_ORIGIN.replace(/\/$/, '')}/privacy`
export const TERMS_OF_USE_URL = `${LEGAL_SITE_ORIGIN.replace(/\/$/, '')}/terms`
export const ABUSE_CONTACT_EMAIL = 'novorony52@gmail.com'
