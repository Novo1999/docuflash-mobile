# Docuflash — App content declarations and UGC release gate

Prepared: 2026-09-18  
Status: do not complete the content-rating or UGC-related declarations until
the decisions and controls below are confirmed.

## App content worksheet

| Play Console area | Current evidence | Submission action |
| --- | --- | --- |
| Privacy policy | No public URL was verified in this mobile project. | **Blocker:** publish and test a signed-out HTTPS policy URL; link it in-app. |
| Ads | No advertising SDK or ad placement was observed in the mobile source. | Proposed answer: No. Release owner must confirm backend/web content and final build also show no ads. |
| App access | Accounts gate upload, management, and request features. | Select restricted functionality and use [`REVIEWER_ACCESS.md`](REVIEWER_ACCESS.md). |
| Account deletion | In-app Profile deletion exists. | **Blocker:** publish/test the required public web deletion-request resource for an app that creates accounts. |
| Target audience | No verified age policy was found. | Product/legal owner must choose an accurate audience and complete the declaration; do not infer an age just to simplify the form. |
| Content rating | Users upload and share documents via public or password-protected links. | Treat this as user-generated-content review; answer the questionnaire from actual controls, not assumptions. |
| Other declarations | No health, financial, government, news, gambling, or special-permission feature was observed in the mobile source. | Review every current Console question; answer Yes if backend/web functionality changes that conclusion. |

## User-generated-content gate

Docuflash accepts files from users and lets them create share/request links,
including public-access links. Google Play’s user-generated-content policy may
therefore apply even though the app is not a social feed. The source audit found
no in-app content reporting, user blocking, moderation flow, or actual linked
Terms/Privacy policy; the only related UI is a non-interactive sign-in sentence.

Before the policy/legal owner selects answers in Play Console, decide and
document whether Docuflash hosts UGC under Google’s current policy. If it does,
the release must implement and operate the applicable controls, including:

- Acceptance of Terms/User Policy before users create or upload content,
  defining prohibited content and behavior.
- A documented moderation/enforcement process with a monitored abuse contact.
- In-app content reporting and user-blocking controls where the policy requires
  them, with clear handling for public versus one-to-one sharing.
- A terms/policy URL and enforcement record that match the live product.

Do not claim “no user-generated content,” “reporting available,” or “blocking
available” merely to complete a form. This is a product and legal decision; it
cannot be solved by listing copy alone.

## Suggested release decision record

| Decision | Owner | Evidence / link | Date |
| --- | --- | --- | --- |
| Does UGC policy apply to public/password file links? | Product + legal | `[REQUIRED]` | `[REQUIRED]` |
| Chosen target audience | Product + legal | `[REQUIRED]` | `[REQUIRED]` |
| Ads declaration evidence | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Privacy-policy URL tested while signed out | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Web deletion request tested while signed out | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Reviewer account and test links tested | Release owner | `[REQUIRED]` | `[REQUIRED]` |

References: [App content declarations](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-GB) and [Google Play user-generated content policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en-GB).
