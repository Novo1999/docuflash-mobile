import { AppText, Button, Card, IconButton } from '@/components/ui'
import { useTheme } from '@/theme/ThemeProvider'
import type { NoteRecord } from '@/types/note'
import { useState } from 'react'
import { TextInput, View } from 'react-native'

type NoteCardProps = {
  note: NoteRecord
  onSave: (id: string, payload: { title?: string | null; content?: string }) => Promise<void>
  onDelete: (note: NoteRecord) => void
}

const formatUpdatedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' · ' + date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })
}

export function NoteCard({ note, onSave, onDelete }: NoteCardProps) {
  const { colors, fonts } = useTheme()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const startEditing = () => {
    setTitle(note.title ?? '')
    setContent(note.content)
    setEditing(true)
  }

  const canSave = title.trim().length > 0 || content.trim().length > 0

  const save = async () => {
    if (!canSave || saving) return
    setSaving(true)
    try {
      await onSave(note.id, { title: title.trim() || null, content })
      setEditing(false)
    } catch {
      // the screen already surfaced the error
    } finally {
      setSaving(false)
    }
  }

  if (editing) {
    return (
      <Card style={{ marginBottom: 11 }}>
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
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
          <Button title="Cancel" variant="outline" onPress={() => setEditing(false)} disabled={saving} size={13} style={{ flex: 1, paddingVertical: 10 }} />
          <Button title="Save" onPress={save} loading={saving} disabled={!canSave} size={13} style={{ flex: 1, paddingVertical: 10 }} />
        </View>
      </Card>
    )
  }

  return (
    <Card style={{ marginBottom: 11 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <View style={{ flex: 1 }}>
          {note.title ? (
            <AppText weight="semibold" size={13.5}>
              {note.title}
            </AppText>
          ) : null}
          {note.content ? (
            <AppText size={12.5} color={colors.text} style={{ marginTop: note.title ? 4 : 0, lineHeight: 18 }}>
              {note.content}
            </AppText>
          ) : null}
          <AppText size={10.5} color={colors.mutedSoft} style={{ marginTop: 8 }}>
            {formatUpdatedAt(note.updatedAt)}
          </AppText>
        </View>
        <IconButton name="edit" onPress={startEditing} />
        <IconButton name="trash" tone="danger" onPress={() => onDelete(note)} style={{ marginLeft: 6 }} />
      </View>
    </Card>
  )
}
