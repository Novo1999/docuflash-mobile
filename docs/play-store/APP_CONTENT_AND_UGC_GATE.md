# Docuflash — App content declarations and UGC release gate

Prepared: 2026-09-18
Updated: 2026-09-18 — UGC decision made and controls implemented.

**UGC decision: the policy applies.** Docuflash hosts user-uploaded files that
are accessible to other people via share links, and accepts inbound uploads
from anonymous senders through file requests. The rationale and evidence are in
[`UGC_POLICY_STUDY.md`](UGC_POLICY_STUDY.md). Answer the Console questions as a
UGC app; do not claim "no user-generated content".

Status: controls are implemented and verified locally. The remaining gates are
deployment, the owner actions in the decision record below, and the operational
commitment in [`MODERATION_RUNBOOK.md`](MODERATION_RUNBOOK.md).

### Implemented UGC controls

| Google requirement | Implementation | Status |
| --- | --- | --- |
| Terms acceptance before creating/uploading UGC | Public `/terms` page; versioned acceptance recorded on the account (`termsAcceptedAt`, `termsVersion`); blocking acceptance gate in the mobile app for new and existing users; `POST /api/auth/accept-terms` | ✅ |
| Defined objectionable content and behaviour | Prohibited-content section of `/terms`, summarised in the in-app acceptance gate | ✅ |
| Ongoing moderation proportionate to the UGC hosted | [`MODERATION_RUNBOOK.md`](MODERATION_RUNBOOK.md); reports stored in `report_entity`; admin triage endpoints gated by `MODERATION_ADMIN_EMAILS` | ✅ implemented, ⬜ owner must commit to running it |
| In-app reporting of objectionable UGC | "Report this file/folder" on the mobile share and folder screens and on the web `/share` and `/folder` pages; works without an account; rate limited | ✅ |
| In-app blocking | File-request sender blocking (mobile) enforced server-side in `addFilesToRequestService`; link revocation via existing delete | ✅ mobile, ⬜ web block control still missing |
| Monetisation safeguards | No in-app monetisation exists | ✅ not applicable |
| Published abuse contact | `novorony52@gmail.com` on `/terms` and `/privacy` | ✅ |

## App content worksheet

| Play Console area | Current evidence | Submission action |
| --- | --- | --- |
| Privacy policy | No public URL was verified in this mobile project. | **Blocker:** publish and test a signed-out HTTPS policy URL; link it in-app. |
| Ads | No advertising SDK or ad placement was observed in the mobile source. | Proposed answer: No. Release owner must confirm backend/web content and final build also show no ads. |
| App access | Accounts gate upload, management, and request features. | Select restricted functionality and use [`REVIEWER_ACCESS.md`](REVIEWER_ACCESS.md). |
| Account deletion | In-app Profile deletion exists. | **Blocker:** publish/test the required public web deletion-request resource for an app that creates accounts. |
| Target audience | No verified age policy was found. | Product/legal owner must choose an accurate audience and complete the declaration; do not infer an age just to simplify the form. |
| Content rating | Users upload and share documents via public or password-protected links, and receive uploads from anonymous senders. | Answer as a UGC app. Reporting and blocking now exist — see the implemented-controls table above — so answer those questions Yes and be ready to show where each control lives. |
| Other declarations | No health, financial, government, news, gambling, or special-permission feature was observed in the mobile source. | Review every current Console question; answer Yes if backend/web functionality changes that conclusion. |

## User-generated-content gate

**Resolved: the policy applies.** Google defines UGC as content users
contribute that is "visible to or accessible by at least a subset of the app's
users", with no exemption for private or link-only sharing. Docuflash both
distributes user files via links and accepts files from anonymous senders
through file requests. Full reasoning in [`UGC_POLICY_STUDY.md`](UGC_POLICY_STUDY.md).

Because there is no discovery surface — share tokens are 128-bit random values,
and there is no feed, search, or profile — moderation is scoped to the reactive
controls rather than proactive scanning. That scoping is a proportionality
argument under the policy, not an exemption from it.

Still true, and still worth repeating: do not claim "no user-generated
content", and do not claim a control works before testing it in the release
build.

Remaining UGC work before submission:

- Deploy the backend migration, `/terms`, and the mobile build carrying the
  report/block/acceptance surfaces.
- Set `MODERATION_ADMIN_EMAILS`, or no one can triage a report.
- Commit to the triage process in [`MODERATION_RUNBOOK.md`](MODERATION_RUNBOOK.md)
  and name its owner.
- Test report and block end to end on the release build before recording them
  as available.
- Close the known gaps listed in the runbook, or accept them explicitly.

## Suggested release decision record

| Decision | Owner | Evidence / link | Date |
| --- | --- | --- | --- |
| Does UGC policy apply to public/password file links? | Product + legal | Yes — [`UGC_POLICY_STUDY.md`](UGC_POLICY_STUDY.md) | 2026-09-18 |
| Chosen target audience | Product + legal | `[REQUIRED]` | `[REQUIRED]` |
| Moderation owner named and triage process accepted | Product + legal | `[REQUIRED]` | `[REQUIRED]` |
| Report and block tested on the release build | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Ads declaration evidence | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Privacy-policy URL tested while signed out | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Web deletion request tested while signed out | Release owner | `[REQUIRED]` | `[REQUIRED]` |
| Reviewer account and test links tested | Release owner | `[REQUIRED]` | `[REQUIRED]` |

References: [App content declarations](https://support.google.com/googleplay/android-developer/answer/9859455?hl=en-GB) and [Google Play user-generated content policy](https://support.google.com/googleplay/android-developer/answer/9876937?hl=en-GB).
