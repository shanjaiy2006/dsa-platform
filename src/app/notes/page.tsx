'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { Plus, FileText, Trash2, Edit3, Save, X, Search, Clock } from 'lucide-react'
import AppLayout from '@/components/layout/AppLayout'
import { Note } from '@/types'
import { formatTimeAgo, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Note | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    fetchNotes()
  }, [])

  const fetchNotes = async () => {
    try {
      const { data } = await axios.get('/api/notes')
      setNotes(data.notes)
    } finally {
      setLoading(false)
    }
  }

  const selectNote = (note: Note) => {
    if (isDirty && !confirm('Discard unsaved changes?')) return
    setSelected(note)
    setEditTitle(note.title)
    setEditContent(note.content)
    setIsNew(false)
    setIsDirty(false)
  }

  const newNote = () => {
    if (isDirty && !confirm('Discard unsaved changes?')) return
    setSelected(null)
    setEditTitle('Untitled Note')
    setEditContent('')
    setIsNew(true)
    setIsDirty(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      if (isNew) {
        const { data } = await axios.post('/api/notes', { title: editTitle, content: editContent })
        setNotes(prev => [data.note, ...prev])
        setSelected(data.note)
        setIsNew(false)
      } else if (selected) {
        await axios.put('/api/notes', { id: selected.id, title: editTitle, content: editContent })
        setNotes(prev => prev.map(n => n.id === selected.id
          ? { ...n, title: editTitle, content: editContent }
          : n
        ))
        setSelected(prev => prev ? { ...prev, title: editTitle, content: editContent } : null)
      }
      setIsDirty(false)
      toast.success('Note saved')
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return
    try {
      await axios.delete(`/api/notes?id=${id}`)
      setNotes(prev => prev.filter(n => n.id !== id))
      if (selected?.id === id) {
        setSelected(null)
        setIsNew(false)
      }
      toast.success('Note deleted')
    } catch {
      toast.error('Failed to delete note')
    }
  }

  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase())
  )

  const hasEditor = isNew || selected !== null

  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-56px)] md:h-screen overflow-hidden">
        {/* Sidebar - note list */}
        <div className="w-72 border-r border-border flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-3">
              <h1 className="font-semibold text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Notes
              </h1>
              <button
                onClick={newNote}
                className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-xs"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              [...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl shimmer" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
                {search ? 'No matching notes' : 'No notes yet'}
                {!search && (
                  <button onClick={newNote} className="block mx-auto mt-2 text-primary text-xs hover:underline">
                    Create your first note
                  </button>
                )}
              </div>
            ) : (
              filtered.map(note => (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => selectNote(note)}
                  className={cn(
                    'p-3 rounded-xl cursor-pointer group transition-all',
                    selected?.id === note.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-accent border border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{note.title}</div>
                      <div className="text-xs text-muted-foreground truncate mt-0.5">{note.content.slice(0, 60) || 'Empty note'}</div>
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground/60">
                        <Clock className="w-2.5 h-2.5" />
                        {formatTimeAgo(note.updatedAt)}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(note.id) }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-400/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!hasEditor ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <FileText className="w-12 h-12 text-muted-foreground/20 mb-4" />
              <div className="text-muted-foreground text-sm mb-4">Select a note or create a new one</div>
              <button
                onClick={newNote}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Note
              </button>
            </div>
          ) : (
            <>
              {/* Editor header */}
              <div className="px-6 py-3 border-b border-border flex items-center justify-between flex-shrink-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {isDirty && <span className="w-1.5 h-1.5 rounded-full bg-primary" title="Unsaved changes" />}
                  {selected && !isDirty && `Saved ${formatTimeAgo(selected.updatedAt)}`}
                  {isDirty && 'Unsaved changes'}
                </div>
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all disabled:opacity-50"
                    >
                      {saving ? <span className="w-3 h-3 border border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" /> : <Save className="w-3 h-3" />}
                      Save
                    </button>
                  )}
                  <button
                    onClick={() => { setSelected(null); setIsNew(false); setIsDirty(false) }}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <input
                type="text"
                value={editTitle}
                onChange={e => { setEditTitle(e.target.value); setIsDirty(true) }}
                placeholder="Note title..."
                className="px-6 py-4 text-xl font-bold text-foreground bg-transparent border-b border-border focus:outline-none placeholder:text-muted-foreground/30 flex-shrink-0"
              />

              {/* Content */}
              <textarea
                value={editContent}
                onChange={e => { setEditContent(e.target.value); setIsDirty(true) }}
                placeholder="Start writing... Use markdown for formatting.

# Heading
**bold** _italic_ `code`

- List item
- Another item

```java
// Code block
public void example() {}
```"
                className="flex-1 px-6 py-4 text-sm text-foreground bg-transparent focus:outline-none resize-none placeholder:text-muted-foreground/30 font-mono leading-relaxed"
              />

              {/* Keyboard shortcut hint */}
              <div className="px-6 py-2 border-t border-border text-xs text-muted-foreground/50 flex-shrink-0">
                {navigator.platform.includes('Mac') ? '⌘' : 'Ctrl'}+S to save
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
