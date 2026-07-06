export type ExpiryPickerProps = {
  visible: boolean
  value: Date
  onConfirm: (date: Date) => void
  onClose: () => void
}
