# Google Play listing assets

Prepared: 2026-09-18  
Status: source assets are ready; screenshots still require recapture from the
final Android release candidate.

| Asset | Path | Verified format | Console use |
| --- | --- | --- | --- |
| Play icon | [`play-icon-v1.png`](play-icon-v1.png) | 512 x 512 PNG, 32-bit | App icon |
| Feature graphic | [`feature-graphic-v1.png`](feature-graphic-v1.png) | 1024 x 500 opaque PNG | Feature graphic |
| Screenshot candidates | [`../../docs/screenshots/`](../../docs/screenshots/) | Six existing phone captures | Reference only; recapture before upload |

The icon and feature graphic are deliberately text-free and make no claims
about encryption, storage location, or features that are not present in the
app. The feature graphic shows a document, sharing path, and lock motif only.

## Screenshot capture brief

Capture up to eight Android-phone screenshots from the final internal-test or
production-like build. Do not use Expo Go. Remove personal information,
production documents, real email addresses, tokens, or unsupported marketing
claims before uploading.

Use this proposed order, replacing the corresponding existing reference image
where it is still representative:

1. Sign in or create-account flow — `docs/screenshots/auth.jpg`
2. Select and upload documents — `docs/screenshots/upload.jpeg`
3. Create a password-protected, expiring share link — capture anew
4. Open a received share link — `docs/screenshots/share-viewer.jpg`
5. Create a file request and display its QR/link — `docs/screenshots/request.jpg`
6. Review uploads and their current status — `docs/screenshots/uploads.jpg`
7. Profile and account controls — `docs/screenshots/profile.jpg`

Before publishing, verify each image reflects the submitted build, renders at
native phone resolution, contains only test content, and matches the store
description. Add concise accessibility descriptions in Play Console; for the
feature graphic: “Illustration of documents moving through a locked sharing
link to the Docuflash document mark.”

Reference: [Google Play graphic asset requirements](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en-GB).
