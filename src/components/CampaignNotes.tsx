'use client';

import { useState } from 'react';

interface Note {
  id: string;
  campaign_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author_name?: string;
}

interface CampaignNotesProps {
  campaignId: string;
  campaignName: string;
}

export default function CampaignNotes({ campaignId, campaignName }: CampaignNotesProps) {
  const [notes, setNotes] = useState<Note[]>([
    {
      id: '1',
      campaign_id: campaignId,
      user_id: 'user-1',
      content: 'Updated targeting to include lookalike audiences. Initial testing shows 20% increase in impressions.',
      created_at: '2024-03-03T14:30:00Z',
      updated_at: '2024-03-03T14:30:00Z',
      author_name: 'Sarah (You)',
    },
    {
      id: '2',
      campaign_id: campaignId,
      user_id: 'user-2',
      content: 'ROAS dropped from 2.5x to 1.8x. Recommending creative refresh next week.',
      created_at: '2024-03-02T10:15:00Z',
      updated_at: '2024-03-02T10:15:00Z',
      author_name: 'Mike',
    },
  ]);

  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;

    setIsSubmitting(true);

    try {
      // In real implementation, POST to /api/campaign-notes
      const note: Note = {
        id: `note-${Date.now()}`,
        campaign_id: campaignId,
        user_id: 'current-user',
        content: newNote,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'You',
      };

      setNotes([note, ...notes]);
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h3 className="text-lg font-semibold mb-6">Campaign Notes</h3>

      {/* Add Note Form */}
      <div className="mb-6 pb-6 border-b border-gray-200">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note about this campaign..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          rows={3}
        />
        <div className="mt-3 flex justify-end gap-2">
          <button
            onClick={() => setNewNote('')}
            disabled={!newNote.trim()}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Clear
          </button>
          <button
            onClick={handleAddNote}
            disabled={!newNote.trim() || isSubmitting}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Add Note'}
          </button>
        </div>
      </div>

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No notes yet. Add one to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <div key={note.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-900">{note.author_name}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(note.created_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-gray-400 hover:text-red-600 transition-colors"
                >
                  ✕
                </button>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
