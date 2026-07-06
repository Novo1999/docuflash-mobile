import { IconButton } from '@/components/ui'

type ActionButtonProps = {
  name: Parameters<typeof IconButton>[0]['name']
  onPress: () => void
  tone?: 'bordered' | 'danger'
}

export function ActionButton({ name, onPress, tone = 'bordered' }: ActionButtonProps) {
  return <IconButton name={name} onPress={onPress} tone={tone} size={34} style={{ flex: 1 }} />
}
