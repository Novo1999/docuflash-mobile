import { checkForUpdateAsync, fetchUpdateAsync, isEnabled, reloadAsync, useUpdates } from 'expo-updates'
import { useCallback, useEffect, useState } from 'react'
import { AppState } from 'react-native'

/**
 * Same-session OTA updates. expo-updates already checks and downloads on launch
 * (checkAutomatically defaults to ON_LOAD), which only applies on the next cold start.
 * This adds a re-check when the app returns to the foreground and exposes a restart
 * action so a downloaded update can be applied without waiting for a cold start.
 */
export function useAppUpdates() {
  const { isUpdatePending, isDownloading, isChecking } = useUpdates()
  const [restarting, setRestarting] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  // checkForUpdateAsync/fetchUpdateAsync reject in dev builds and Expo Go.
  const checkForUpdate = useCallback(async () => {
    if (!isEnabled || __DEV__) return
    try {
      const result = await checkForUpdateAsync()
      if (result.isAvailable) await fetchUpdateAsync()
    } catch {
      // offline or unreachable update server — keep running the current bundle
    }
  }, [])

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void checkForUpdate()
    })
    return () => subscription.remove()
  }, [checkForUpdate])

  const restart = useCallback(async () => {
    setRestarting(true)
    try {
      await reloadAsync()
    } catch {
      // reload failed — clear the spinner so the user can retry
      setRestarting(false)
    }
  }, [])

  return {
    isUpdateReady: isUpdatePending && !dismissed,
    isDownloading,
    isChecking,
    restarting,
    restart,
    dismiss: useCallback(() => setDismissed(true), []),
  }
}
