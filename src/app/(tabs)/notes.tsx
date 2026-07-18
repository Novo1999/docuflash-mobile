import { Icon } from '@/components/Icon'
import { NoteCard, NoteComposer } from '@/components/notes'
import { AppText, ConfirmModal } from '@/components/ui'
import { createNote, deleteNote, getMyNotes, updateNote } from '@/lib/api/notes'
import { useTheme } from '@/theme/ThemeProvider'
import type { NoteRecord } from '@/types/note'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, RefreshControl, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function NotesScreen() {
  const { colors } = useTheme()
  const [notes, setNotes] = useState<NoteRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<NoteRecord | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    try {
      setNotes(await getMyNotes())
    } catch {
      // list simply stays as-is; pull-to-refresh retries
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      try {
        const myNotes = await getMyNotes()
        if (active) setNotes(myNotes)
      } catch {
        // list simply stays empty; pull-to-refresh retries
      } finally {
        if (active) setLoading(false)
      }
    })()
    return () => {
      active = false
    }
  }, [])

  const handleCreate = useCallback(async (payload: { title?: string; content: string }) => {
    try {
      const created = await createNote(payload)
      setNotes((current) => [created, ...current])
    } catch (e) {
      Alert.alert('Could not save note', e instanceof Error ? e.message : 'Please try again.')
      throw e
    }
  }, [])

  const handleSave = useCallback(async (id: string, payload: { title?: string | null; content?: string }) => {
    try {
      const updated = await updateNote(id, payload)
      setNotes((current) => [updated, ...current.filter((note) => note.id !== id)])
    } catch (e) {
      Alert.alert('Could not update note', e instanceof Error ? e.message : 'Please try again.')
      throw e
    }
  }, [])

  const runDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await deleteNote(pendingDelete.id)
      setNotes((current) => current.filter((note) => note.id !== pendingDelete.id))
      setPendingDelete(null)
    } catch {
      Alert.alert('Delete failed', 'Something went wrong. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  const listHeader = (
    <>
      <AppText variant="heading" size={28} color={colors.heading} style={{ marginTop: 6 }}>
        Notes
      </AppText>
      <AppText size={12.5} color={colors.mutedSoft} style={{ marginTop: 4, marginBottom: 14 }}>
        Quick personal notes, only visible to you.
      </AppText>
      <NoteComposer onCreate={handleCreate} />
    </>
  )

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screen }} edges={['top']}>
      <FlatList
        data={notes}
        keyExtractor={(note) => note.id}
        renderItem={({ item }) => <NoteCard note={item} onSave={handleSave} onDelete={setPendingDelete} />}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.accent} style={{ marginTop: 40 }} />
          ) : (
            <View style={{ alignItems: 'center', gap: 8, marginTop: 36 }}>
              <Icon name="note" size={30} color={colors.mutedSoft} strokeWidth={1.5} />
              <AppText size={13} color={colors.muted}>
                No notes yet
              </AppText>
              <AppText size={11.5} color={colors.mutedSoft} style={{ textAlign: 'center', maxWidth: 240 }}>
                Anything you jot down here stays private to your account.
              </AppText>
            </View>
          )
        }
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true)
              load()
            }}
            tintColor={colors.accent}
          />
        }
      />

      <ConfirmModal
        visible={pendingDelete !== null}
        icon="trash"
        tone="danger"
        title="Delete note"
        message="This permanently removes the note."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={runDelete}
        onClose={() => setPendingDelete(null)}
      />
    </SafeAreaView>
  )
}
