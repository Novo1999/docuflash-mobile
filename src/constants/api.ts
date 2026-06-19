// Configure with EXPO_PUBLIC_BASE_URL (e.g. http://192.168.x.x:8000 for local backend).
// Falls back to the deployed API so the app works on a device out of the box.
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL ?? 'https://docuflash-api.vercel.app'
