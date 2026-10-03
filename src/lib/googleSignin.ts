import { GoogleSignin, isErrorWithCode, isSuccessResponse, statusCodes } from '@react-native-google-signin/google-signin'

const ANDROID_DEVELOPER_ERROR = '10'

/**
 * Native Google Sign-In configuration.
 *
 * Requires a custom dev build — this native module does NOT work in Expo Go.
 *
 * Set these in your `.env` (see `.env.example`):
 *  - EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID — the "Web client" OAuth client ID from the
 *    Google Cloud console. Required to receive an `idToken` you can verify server-side.
 *  - EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID — the "iOS client" OAuth client ID (iOS only).
 *
 * The iOS URL scheme (reversed iOS client ID) is configured separately in
 * `app.json` under the google-signin config plugin's `iosUrlScheme`.
 */
export function configureGoogleSignin() {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  })
}

export async function getGoogleIdToken(): Promise<string | null> {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
    if (GoogleSignin.hasPreviousSignIn()) await GoogleSignin.signOut()
    const response = await GoogleSignin.signIn()
    if (!isSuccessResponse(response)) return null
    if (!response.data.idToken) {
      throw new Error('Google sign-in is not configured for this build of the app. [missing idToken]')
    }
    return response.data.idToken
  } catch (e) {
    if (isErrorWithCode(e) && e.code === statusCodes.SIGN_IN_CANCELLED) return null
    throw toGoogleSigninError(e)
  }
}

export async function signOutFromGoogle({ revoke = false }: { revoke?: boolean } = {}) {
  try {
    if (!GoogleSignin.hasPreviousSignIn()) return
    if (revoke) await GoogleSignin.revokeAccess()
    else await GoogleSignin.signOut()
  } catch {}
}

function toGoogleSigninError(error: unknown): Error {
  if (!isErrorWithCode(error)) {
    return error instanceof Error ? error : new Error('Google sign-in failed. Please try again.')
  }
  switch (error.code) {
    case statusCodes.IN_PROGRESS:
      return new Error('Google sign-in is already in progress.')
    case statusCodes.PLAY_SERVICES_NOT_AVAILABLE:
      return new Error('Google Play Services is missing or out of date on this device.')
    case ANDROID_DEVELOPER_ERROR:
      return new Error('Google sign-in is not configured for this build of the app. [DEVELOPER_ERROR]')
    default:
      return new Error(`Google sign-in failed. Please try again. [${error.code}]`)
  }
}
