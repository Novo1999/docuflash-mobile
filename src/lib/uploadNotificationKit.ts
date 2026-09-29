import notifee, { AndroidImportance, AuthorizationStatus } from 'react-native-notify-kit'
import { Platform } from 'react-native'

const CHANNEL_ID = 'docuflash_uploads'
const NOTIFICATION_ID = 'docuflash_upload'

let notificationIsActive = false
let foregroundServiceRegistered = false

/** Requests notification access before the user starts their first upload. */
export async function requestNotificationPermissionOnLaunch(): Promise<void> {
  if (Platform.OS === 'web') return

  try {
    const settings = await notifee.getNotificationSettings()
    if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED) {
      await notifee.requestPermission()
    }
  } catch {
    // Notification access is optional and must never block app startup.
  }
}

/**
 * Must run before the first foreground-service notification is displayed.
 * The runner intentionally remains pending until the upload finishes.
 */
export function initializeUploadNotifications(): void {
  if (Platform.OS !== 'android' || foregroundServiceRegistered) return

  try {
    notifee.registerForegroundService(() => new Promise<void>(() => {}))
    foregroundServiceRegistered = true
  } catch {
    // Starting an upload remains possible if notification setup is unavailable.
  }
}

/**
 * Starts Notify Kit's Android data-sync foreground service before the transfer.
 * The service is intentionally Android-only: iOS has no equivalent ongoing
 * notification for this JavaScript-based upload client.
 */
export async function startUploadNotification(fileCount: number): Promise<void> {
  if (Platform.OS !== 'android') return

  initializeUploadNotifications()

  try {
    // On Android 13+, this displays the system notification permission prompt.
    // A declined prompt does not stop the foreground service; Android surfaces
    // its notice in the system task manager instead of the notification drawer.
    await notifee.requestPermission()
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'File uploads',
      importance: AndroidImportance.LOW,
    })
    await notifee.displayNotification({
      id: NOTIFICATION_ID,
      title: fileCount === 1 ? 'Uploading file' : `Uploading ${fileCount} files`,
      body: 'Preparing upload…',
      android: {
        channelId: CHANNEL_ID,
        asForegroundService: true,
        ongoing: true,
        onlyAlertOnce: true,
        pressAction: { id: 'default', launchActivity: 'default' },
        progress: { max: 100, current: 0, indeterminate: true },
      },
    })
    notificationIsActive = true
  } catch {
    // A notification failure must never prevent the user from uploading.
  }
}

export function updateUploadNotification(progress: number): void {
  if (!notificationIsActive || Platform.OS !== 'android') return

  try {
    const rounded = Math.round(Math.max(0, Math.min(100, progress)))
    void notifee.displayNotification({
      id: NOTIFICATION_ID,
      title: 'Uploading file',
      body: `${rounded}% complete`,
      android: {
        channelId: CHANNEL_ID,
        asForegroundService: true,
        ongoing: true,
        onlyAlertOnce: true,
        pressAction: { id: 'default', launchActivity: 'default' },
        progress: { max: 100, current: rounded },
      },
    })
  } catch {
    // Keep the in-app upload alive if the operating system rejects an update.
  }
}

export function finishUploadNotification(succeeded: boolean): void {
  if (!notificationIsActive || Platform.OS !== 'android') return

  notificationIsActive = false
  void (async () => {
    try {
      await notifee.stopForegroundService()
      if (!succeeded) {
        await notifee.displayNotification({
          id: NOTIFICATION_ID,
          title: 'Upload failed',
          body: 'Your files were not uploaded. Try again.',
          android: {
            channelId: CHANNEL_ID,
            onlyAlertOnce: true,
            pressAction: { id: 'default', launchActivity: 'default' },
          },
        })
      } else {
        await notifee.cancelNotification(NOTIFICATION_ID)
      }
    } catch {
      // Upload completion must not depend on notification cleanup.
    }
  })()
}
