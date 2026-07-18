import type { NoteRecord } from '@/types/note'
import { apiClient, requireApiData } from './client'

export async function getMyNotes(): Promise<NoteRecord[]> {
  const response = await apiClient<NoteRecord[]>('/api/notes')
  return requireApiData(response, 'Failed to load your notes')
}

export async function createNote(payload: { title?: string; content: string }): Promise<NoteRecord> {
  const response = await apiClient<NoteRecord>('/api/notes', { method: 'POST', body: payload })
  return requireApiData(response, 'Failed to create note')
}

export async function updateNote(id: string, payload: { title?: string | null; content?: string }): Promise<NoteRecord> {
  const response = await apiClient<NoteRecord>(`/api/notes/${id}`, { method: 'PATCH', body: payload })
  return requireApiData(response, 'Failed to update note')
}

export async function deleteNote(id: string): Promise<void> {
  const response = await apiClient<null>(`/api/notes/${id}`, { method: 'DELETE' })
  requireApiData(response, 'Failed to delete note')
}
