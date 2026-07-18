import { Button, Card } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import { useState } from 'react'
import { TextInput } from 'react-native'

type NoteComposerProps = {
  onCreate: (payload: { title?: string; content: string }) => Promise<void>
}

export function NoteComposer({ onCreate }: NoteComposerProps) {
  const { colors, fonts } = useTheme()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const canSave = title.trim().length > 0 || content.trim().length > 0

  const submit = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await onCreate({ title: title.trim() || undefined, content })
      setTitle('')
      setContent('')
    } catch {
      // the screen already surfaced the error
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card style={{ marginBottom: 14 }}>
      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title (optional)"
        placeholderTextColor={colors.mutedSoft}
        maxLength={200}
        style={{ fontFamily: fonts.bodySemiBold, fontSize: 13.5, color: colors.text, padding: 0 }}
      />
      <TextInput
        value={content}
        onChangeText={setContent}
        placeholder="Jot something down…"
        placeholderTextColor={colors.mutedSoft}
        multiline
        maxLength={20000}
        style={{
          fontFamily: fonts.body,
          fontSize: 13,
          color: colors.text,
          padding: 0,
          marginTop: 8,
          minHeight: 64,
          textAlignVertical: 'top',
        }}
      />
      <Button
        title="Add note"
        icon="plus"
        onPress={submit}
        loading={saving}
        disabled={!canSave}
        size={13.5}
        style={{ marginTop: 12, paddingVertical: 11 }}
      />
    </Card>
  )
}
