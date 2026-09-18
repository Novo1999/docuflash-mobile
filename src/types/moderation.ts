export type ReportTargetType = 'file' | 'folder'

export type ReportReason = 'csam' | 'non_consensual' | 'illegal' | 'malware' | 'harassment' | 'intellectual_property' | 'spam' | 'other'

export type CreateReportPayload = {
  targetType: ReportTargetType
  shareToken: string
  reason: ReportReason
  details?: string
  reporterEmail?: string
}

export type ReportReceipt = {
  id: string
  status: string
  createdAt: string
}

export type BlockedSender = {
  id: string
  folderId: string
  senderClientId: string
  ownerId: string | null
  ownerClientId: string | null
  createdAt: string
}

export type BlockSenderPayload = {
  folderId: string
  senderClientId: string
  ownerClientId?: string
}

export const REPORT_REASON_OPTIONS: { value: ReportReason; label: string }[] = [
  { value: 'csam', label: 'Child sexual abuse material' },
  { value: 'non_consensual', label: 'Non-consensual intimate imagery' },
  { value: 'illegal', label: 'Illegal content' },
  { value: 'malware', label: 'Malware or a harmful file' },
  { value: 'harassment', label: 'Harassment, threats, or hate speech' },
  { value: 'intellectual_property', label: 'Copyright or trademark infringement' },
  { value: 'spam', label: 'Spam, phishing, or fraud' },
  { value: 'other', label: 'Something else' },
]
