import { atom } from 'jotai'

/** True while a file upload is in flight. Drives the global progress bar and disables the upload form. */
export const isUploadingAtom = atom(false)

/** Overall upload progress as a percentage (0–100). */
export const uploadProgressAtom = atom(0)

/**
 * Increments after a successful upload has been registered with the API.
 * Screens that show server-backed uploads can subscribe to this instead of
 * relying on navigation focus to discover newly-created files and folders.
 */
export const myUploadsRevisionAtom = atom(0)

export const invalidateMyUploadsAtom = atom(null, (_get, set) => {
  set(myUploadsRevisionAtom, (revision) => revision + 1)
})
