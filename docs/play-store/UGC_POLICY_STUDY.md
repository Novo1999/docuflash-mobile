# Docuflash — Google Play UGC policy study

Prepared: 2026-09-18
Purpose: resolve the Phase 3 UGC gate in
[`APP_CONTENT_AND_UGC_GATE.md`](APP_CONTENT_AND_UGC_GATE.md) with an
evidence-based recommendation, so the product/legal owner can make a decision
rather than a guess.

This document is research plus a recommendation. It does not change any code.

---

## 1. What the policy actually says

Google defines UGC as:

> "content that users contribute to an app, and which is visible to or
> accessible by at least a subset of the app's users."

An app that contains or features UGC must implement moderation that:

1. requires users to accept the app's terms of use and/or user policy **before
   they can create or upload UGC**;
2. defines objectionable content and behaviours, consistent with Play policy;
3. conducts ongoing moderation proportionate to the type of UGC hosted;
4. provides an **in-app system for reporting and blocking** objectionable UGC
   and users, and takes action where appropriate;
5. provides safeguards so in-app monetisation does not encourage objectionable
   behaviour.

Google's moderation guidance adds that the app must have a clear, accessible
Terms of Use that users cannot skip, and that report/block must be "readily
accessible from within the app", clearly labelled, and ideally separate
functions.

Sources: [User Generated Content policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en-GB),
[Understanding moderation requirements](https://support.google.com/googleplay/android-developer/answer/12923286?hl=en).

### What the policy does *not* say

There is **no exemption for private or one-to-one sharing**. The definition
turns on whether content is accessible to other users at all — not on whether
there is a browsable public feed. The policy text explicitly reaches
direct-messaging apps (which it says need blocking) and "specialised browsers
or clients" that merely point at a UGC platform.

The one real gradient in the policy is *proportionality*: moderation must be
"reasonable and consistent with the type of UGC hosted". That is where
Docuflash's argument lives — not in claiming the policy is inapplicable.

---

## 2. Docuflash's actual content surfaces

Evidence from the backend data model and the mobile/web clients:

| Surface | Who can contribute | Who can access | UGC? |
| --- | --- | --- | --- |
| File upload + share link (`FileEntity`, `accessType: PUBLIC`) | Signed-in user | Anyone holding the link URL | **Yes** |
| File upload + share link (`accessType: PROTECTED`) | Signed-in user | Anyone holding the link **and** the password | **Yes** |
| Folder share link (`FolderEntity`) | Signed-in user | Anyone holding the link | **Yes** |
| **File request** (`FolderEntity.acceptsUploads = true`) | **Anonymous third party**, no account | The requesting user | **Yes — and inbound** |
| Nearby-device transfer (Supabase Presence) | Device on the same network | The receiving device | **Yes — person-to-person** |
| Notes (`NoteEntity`) | Signed-in user | That user only | No (not accessible to others) |

Two facts matter most:

**Share tokens are unguessable.** `crypto.randomBytes(16).toString('hex')` —
128 bits, generated in [`file.service.ts:35`](../../../Docuflash-Backend/src/services/file.service.ts). So a "public" Docuflash link is
*unlisted*, not *discoverable*. There is no index, search, browse, feed,
profile, or any surface where one user encounters another user's content
without being handed the URL. This is a genuine and defensible mitigating fact.

**But content flows inbound from strangers.** The file-request feature
(`FolderEntity.acceptsUploads`) lets an anonymous person with no account upload
files into a signed-in user's folder. That is the single strongest reason the
policy applies: a Docuflash user can receive objectionable content from someone
they cannot identify, and today has no in-app way to report it or stop that
sender.

---

## 3. Assessment

**The UGC policy applies to Docuflash.** Recommending otherwise would not
survive review, and "no user-generated content" is not a truthful answer to the
App content questionnaire for an app whose entire purpose is hosting and
distributing user-uploaded files.

The realistic risk is not that Google rejects the concept — plenty of file
transfer apps (WeTransfer-likes, SHAREit, Send Anywhere) ship on Play. It is
that a submission declaring UGC while shipping **zero** report/block/terms
surfaces gets rejected, and repeated policy rejections on a brand-new developer
account are expensive.

What proportionality buys us: because there is no discovery surface, Docuflash
does not need proactive scanning, a moderation queue staffed in real time, or
content classifiers. It needs the reactive controls — terms, report, block,
a monitored abuse address, and a documented takedown process.

What it does not buy us: skipping those controls entirely.

---

## 4. Minimum compliant implementation

Ordered by how strictly the policy requires it.

### Required

**A. Terms of Use acceptance before first upload.**
Today [`src/app/auth.tsx`](../../src/app/auth.tsx) shows the sentence "By
continuing you agree to our Terms and Privacy Policy" with only Privacy Policy
as a working link. There is no Terms document and no recorded acceptance.
Needs: a public `/terms` page defining prohibited content, a working in-app
link, and a versioned acceptance recorded against the account
(`termsAcceptedAt`, `termsVersion` on `UserEntity`).

**B. Prohibited-content definition.** Content of the `/terms` page: no CSAM,
no non-consensual intimate imagery, no malware, no illegal content, no
harassment, no IP infringement. Must state that Docuflash removes content and
terminates accounts for violations.

**C. In-app reporting.**
- On the **recipient** side: a "Report this file" control on the web share and
  folder pages (reachable without an account — the recipient may not have one)
  and in the mobile viewer.
- On the **file-request** side: the owner can report an inbound file.

Backend: a `report` table, an unauthenticated rate-limited `POST /api/reports`,
and an email to the abuse address.

**D. Blocking.** This is where Docuflash's model is awkward and needs the
product decision in §5 — there is no persistent user-to-user relationship to
block. The honest mappings are:

- Block an **uploader on a file request** (by the anonymous client ID / a
  per-request sender identity), so that sender can no longer upload to that
  request.
- **Revoke a link** — the owner kills a share link immediately.
- Block a **nearby device** from sending to you.

**E. Monitored abuse contact.** A real, monitored email published on `/terms`,
`/privacy`, and in the Play listing. Google checks this.

### Operational (not code)

**F. Documented takedown process** — who triages reports, target response time,
what actions are available, and a record of enforcement. Google can ask.

### Explicitly not required here

Proactive scanning, age-gating, and the incidental-sexual-content filter rules
do not apply unless the product chooses to allow that content class, which the
Terms should prohibit outright.

---

## 5. Decisions the owner must make

1. **Scope of blocking.** Docuflash has no friend/follow graph, so "block a
   user" must be redefined. Which of the three mappings in (D) ship for v1?
2. **Abuse contact address.** Which monitored mailbox?
3. **Terms authorship.** Does legal write `/terms`, or do we ship a drafted
   version for review?
4. **Retroactive acceptance.** Existing accounts predate any terms — do they
   get an acceptance prompt on next launch, or is acceptance only enforced for
   new accounts?
5. **Launch sequencing.** Ship UGC controls before the first Play upload
   (slower, safer), or submit to Internal Testing now and add them before
   production (faster, but Internal Testing is also policy-reviewed for a new
   account).

---

## 6. Recommendation

Implement A–E before the first Play upload, with blocking scoped to
**file-request sender blocking + link revocation** for v1, and nearby-device
blocking deferred unless that feature ships in the 1.0 build. Draft `/terms`
in-repo for legal review rather than blocking on legal to start. This is
roughly a backend migration plus one endpoint group, one web page, and three
client surfaces — days, not weeks — and it removes the most likely rejection
reason for a first-time developer account.
