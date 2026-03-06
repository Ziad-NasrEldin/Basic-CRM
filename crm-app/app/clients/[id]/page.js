'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function ClientDetailPage() {
    const { id } = useParams();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [noteContent, setNoteContent] = useState('');
    const [submittingNote, setSubmittingNote] = useState(false);
    const [noteError, setNoteError] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [editingStatus, setEditingStatus] = useState(false);
    const [selectedStatusId, setSelectedStatusId] = useState('');

    async function fetchClient() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/clients/${id}`);
            if (res.status === 404) { setError('Client not found.'); return; }
            if (!res.ok) throw new Error('Failed to load client');
            setClient(await res.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchClient(); }, [id]); // eslint-disable-line

    useEffect(() => {
        fetch('/api/client-statuses')
            .then(res => res.json())
            .then(data => setStatuses(data))
            .catch(console.error);
    }, []);

    async function handleAddNote(e) {
        e.preventDefault();
        setNoteError('');
        if (!noteContent.trim()) { setNoteError('Note content cannot be empty.'); return; }

        setSubmittingNote(true);
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: parseInt(id), content: noteContent }),
            });
            const data = await res.json();
            if (!res.ok) { setNoteError(data.error || 'Failed to add note.'); return; }
            setNoteContent('');
            await fetchClient();
        } catch {
            setNoteError('Something went wrong. Please try again.');
        } finally {
            setSubmittingNote(false);
        }
    }

    async function handleUpdateStatus(newStatusId) {
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId: newStatusId || null }),
            });
            if (!res.ok) throw new Error('Failed to update status');
            await fetchClient();
            setEditingStatus(false);
        } catch (err) {
            alert(err.message);
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                Loading...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>
                <Link href="/" style={{ color: 'var(--color-primary)', fontSize: 14 }}>← Back to clients</Link>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <header className="mv-header">
                <div className="mv-header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/" className="mv-back">← Clients</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">Client Details</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Link href="/settings" className="mv-back" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚙️ Settings</Link>
                        <Link href="/" className="mv-logo">
                            <Image src="/mavoid-logo.png" alt="MaVoid" width={28} height={28} style={{ objectFit: 'contain' }} />
                            <span className="mv-logo-word" style={{ fontSize: 15 }}>MaVoid</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Client Info Card */}
                <div className="mv-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                            Client
                        </p>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: 4 }}>
                            {client.fullName}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
                            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>{client.phoneNumber}</p>
                            {client.product && (
                                <>
                                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--color-border)' }} />
                                    <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                        {client.product.name}
                                    </span>
                                </>
                            )}
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {editingStatus ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                <select
                                    value={selectedStatusId}
                                    onChange={(e) => setSelectedStatusId(e.target.value)}
                                    className="mv-input"
                                    style={{ 
                                        fontSize: 13, 
                                        padding: '6px 32px 6px 10px',
                                        minWidth: 150,
                                        appearance: 'none', 
                                        background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236B7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right 8px center / 14px 14px'
                                    }}
                                >
                                    <option value="">No Status</option>
                                    {statuses.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button
                                        onClick={() => handleUpdateStatus(selectedStatusId)}
                                        className="mv-btn-primary"
                                        style={{ fontSize: 12, padding: '5px 12px' }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingStatus(false);
                                            setSelectedStatusId(client.statusId || '');
                                        }}
                                        className="mv-btn-secondary"
                                        style={{ fontSize: 12, padding: '5px 12px' }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                {client.status ? (
                                    <span 
                                        className="mv-badge" 
                                        style={{ 
                                            background: client.status.color + '20', 
                                            color: client.status.color,
                                            border: `1px solid ${client.status.color}40`,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => {
                                            setEditingStatus(true);
                                            setSelectedStatusId(client.statusId || '');
                                        }}
                                        title="Click to change status"
                                    >
                                        {client.status.name} ✏️
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingStatus(true);
                                            setSelectedStatusId('');
                                        }}
                                        className="mv-badge"
                                        style={{ 
                                            background: '#f3f4f6', 
                                            color: 'var(--color-text-muted)',
                                            cursor: 'pointer',
                                            border: 'none'
                                        }}
                                    >
                                        + Add Status
                                    </button>
                                )}
                            </div>
                        )}
                        <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 6, marginBottom: 0 }}>
                            Since {formatDate(client.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Add Note */}
                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Add Note
                    </p>

                    {noteError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{noteError}</div>}

                    <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <textarea
                            id="note-textarea"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder="Write a note about this client..."
                            rows={4}
                            className="mv-textarea"
                        />
                        <div>
                            <button
                                id="submit-note-btn"
                                type="submit"
                                disabled={submittingNote}
                                className="mv-btn-primary"
                            >
                                {submittingNote ? 'Saving...' : 'Add Note'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Notes List */}
                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Notes ({client.notes.length})
                    </p>

                    {client.notes.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            No notes yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {client.notes.map((note, i) => (
                                <div key={note.id} className="mv-card" style={{ padding: '16px 20px', position: 'relative' }}>
                                    {i === 0 && (
                                        <span className="mv-badge" style={{ position: 'absolute', top: 16, right: 20, fontSize: 10 }}>Latest</span>
                                    )}
                                    <p style={{ fontSize: 14, color: 'var(--color-text)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {note.content}
                                    </p>
                                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 10, marginBottom: 0, letterSpacing: '0.03em' }}>
                                        {formatDateTime(note.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
