# Docuflash privacy-policy fact check

Prepared: 2026-09-18  
Status: publication checklist, not a finished public privacy policy.

Before publishing a policy, have the organization’s privacy/legal owner replace
every bracketed item with confirmed facts. The policy must be hosted at a
public, stable HTTPS URL, be accessible without sign-in, and be linked from the
app as well as Play Console.

## Minimum public-policy content

1. **Publisher identity and contact.** Legal entity name, postal address where
   required, support/privacy email, and effective date.
2. **Data collected.** Email, display name, account identifiers, credentials
   as applicable, uploaded files and metadata, link/password/expiry choices,
   avatar image, device/app identifiers, locally stored preferences, Google
   sign-in data, and Realtime transfer metadata — only to the extent actually
   collected in production.
3. **Purposes.** Account authentication, document upload/sharing, file
   requests, support, security/abuse prevention, and any other verified use.
4. **Recipients.** Docuflash and each verified processor/subprocessor
   (including the relevant UploadThing, Supabase, authentication, hosting, and
   Google sign-in services), with the reason each receives data.
5. **Link visibility.** Clearly explain what “public” means, the effect of a
   password, how an expiry works, and that a recipient may further distribute a
   link or file. Do not promise end-to-end encryption unless verified.
6. **Retention and deletion.** State actual account, document, link, log,
   backup, and processor-retention periods. Explain what expires automatically,
   what account deletion removes, any legal/security exceptions, and when
   downstream deletion occurs.
7. **Security.** Describe only controls that the organization has verified;
   avoid absolute promises such as “completely secure.”
8. **User choices and rights.** Explain how to update a profile, revoke access
   where supported, request access/correction/deletion, and contact the privacy
   team; include regional rights only after legal review.
9. **Account deletion.** Give the in-app path and a public signed-out web
   deletion URL. Explain required identity checks and expected completion time.
10. **Children and changes.** State the actual audience/age policy and how
    users will be notified of material changes.

## Required fact table

| Fact needed | Owner / evidence | Final value |
| --- | --- | --- |
| Legal publisher and privacy contact | Business/legal owner | `[REQUIRED]` |
| Public policy URL | Web owner | `[BLOCKER — must be live]` |
| Public account-deletion URL | Web/backend owner | `[BLOCKER — must be live and work signed out]` |
| Production API, file host, auth, Realtime, analytics, and support providers | Backend owner | `[REQUIRED]` |
| All production data fields and network destinations | Backend owner + release test | `[REQUIRED]` |
| Retention, expiry, deletion, backup, and legal-hold behavior | Backend + legal owner | `[REQUIRED]` |
| Encryption/access controls and incident contact | Security owner | `[REQUIRED]` |
| Target audience and children's-data posture | Product + legal owner | `[REQUIRED]` |
| Rights/deletion request procedure and timing | Privacy/legal owner | `[REQUIRED]` |

## In-app implementation gap

`src/app/auth.tsx` presently says, “By continuing you agree to our Terms and
Privacy Policy,” but the sentence is not a verified link and there is no
affirmative, versioned policy acceptance. Add working policy links and, if the
legal/product decision requires consent, an explicit recordable consent action
before relying on that statement.

Reference: [Google Play privacy policy requirement](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-GB).
