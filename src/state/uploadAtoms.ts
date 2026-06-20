import { atom } from 'jotai'

/** True while a file upload is in flight. Drives the global progress bar and disables the upload form. */
export const isUploadingAtom = atom(false)

/** Overall upload progress as a percentage (0–100). */
export const uploadProgressAtom = atom(0)
