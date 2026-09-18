# Google Play reviewer access instructions

Prepared: 2026-09-18  
Status: fill in with an active, isolated test account immediately before
submission. Never commit actual credentials to this repository.

## App access declaration

Select **All or some functionality is restricted** if the submitted build
continues to require a Docuflash account to create/manage uploads and file
requests. A reviewer can open an active public share link without logging in,
but account functions are authentication-gated.

## Paste-ready instruction template

```text
Authentication is required to test account, upload, share, and file-request
features. Use this active test account:

Email: [SUBMISSION-ONLY TEST EMAIL]
Password: [SUBMISSION-ONLY TEST PASSWORD]

Sign-in steps:
1. Launch Docuflash.
2. Select Sign in.
3. Enter the test email and password above.
4. Do not use Google or GitHub sign-in; email/password access covers review.

Test content supplied by us:
- An uploaded test document is visible in My Uploads.
- A public share link: [ACTIVE TEST URL]
- A password-protected share link: [ACTIVE TEST URL]
  Password: [TEST LINK PASSWORD]
- A file-request link: [ACTIVE TEST URL]

No OTP, MFA, paid subscription, geographic restriction, or special hardware is
required. [DELETE OR CORRECT THIS SENTENCE AFTER VERIFYING THE FINAL BUILD.]

If access fails, contact [MONITORED REVIEW SUPPORT EMAIL] and we will restore
the test account and test links promptly.
```

## Submission-day checks

- [ ] Create a dedicated review account owned by the organization, with no real
  user content, payment data, or elevated production permissions.
- [ ] Verify the credentials on a clean device and leave the account active
  throughout review; do not require email verification after submission.
- [ ] Upload safe, representative test files and create non-expiring-or-long-
  lived test links for the likely review window.
- [ ] Test public, password-protected, and expired/denied states. Ensure any
  password is supplied in the Console instructions.
- [ ] State all restrictions, OTP/MFA behavior, country/device constraints,
  and test steps plainly. Update instructions if the build changes.
- [ ] Put credentials only in Play Console’s App access section or the
  organization password manager — never source control, screenshots, or the
  public privacy policy.

Reference: [Provide app access instructions for Google Play review](https://support.google.com/googleplay/android-developer/answer/15748846?hl=en-GB).
