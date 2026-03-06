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

function isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
}

function priorityStyle(priority) {
    if (priority === 'high') {
        return { background: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca' };
    }
    if (priority === 'low') {
        return { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' };
    }
    return { background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' };
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

    const [taskTitle, setTaskTitle] = useState('');
    const [taskDescription, setTaskDescription] = useState('');
    const [taskDueAt, setTaskDueAt] = useState('');
    const [taskRemindAt, setTaskRemindAt] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [taskError, setTaskError] = useState('');
    const [submittingTask, setSubmittingTask] = useState(false);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

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

    useEffect(() => {
        fetchClient();
    }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        fetch('/api/client-statuses')
            .then((res) => res.json())
            .then((data) => setStatuses(data))
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
                body: JSON.stringify({ clientId: parseInt(id, 10), content: noteContent }),
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

    async function handleAddTask(e) {
        e.preventDefault();
        setTaskError('');

        if (!taskTitle.trim()) {
            setTaskError('Task title is required.');
            return;
        }

        setSubmittingTask(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: parseInt(id, 10),
                    title: taskTitle,
                    description: taskDescription,
                    dueAt: taskDueAt || null,
                    remindAt: taskRemindAt || null,
                    priority: taskPriority,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                setTaskError(data.error || 'Failed to create task.');
                return;
            }

            setTaskTitle('');
            setTaskDescription('');
            setTaskDueAt('');
            setTaskRemindAt('');
            setTaskPriority('medium');
            await fetchClient();
        } catch {
            setTaskError('Something went wrong. Please try again.');
        } finally {
            setSubmittingTask(false);
        }
    }

    async function handleToggleTask(taskId, completed) {
        setUpdatingTaskId(taskId);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ completed }),
            });
            if (!res.ok) throw new Error('Failed to update task');
            await fetchClient();
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingTaskId(null);
        }
    }

    async function handleDeleteTask(taskId) {
        if (!confirm('Delete this task?')) return;

        setUpdatingTaskId(taskId);
        try {
            const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete task');
            await fetchClient();
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingTaskId(null);
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
                <Link href="/" style={{ color: 'var(--color-primary)', fontSize: 14 }}>Back to clients</Link>
            </div>
        );
    }

    const openTasks = client.tasks.filter((task) => !task.completed);
    const doneTasks = client.tasks.filter((task) => task.completed);

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            <header className="mv-header">
                <div className="mv-header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/" className="mv-back">Clients</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">Client Details</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Link href="/settings" className="mv-back" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Settings</Link>
                        <Link href="/" className="mv-logo">
                            <Image src="/mavoid-logo.png" alt="MaVoid" width={28} height={28} style={{ objectFit: 'contain' }} />
                            <span className="mv-logo-word" style={{ fontSize: 15 }}>MaVoid</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div className="mv-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                            Client
                        </p>
                        <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)', margin: 0, marginBottom: 4 }}>
                            {client.fullName}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                            <p style={{ fontSize: 14, color: 'var(--color-text-muted)', margin: 0 }}>{client.phoneNumber}</p>
                            {client.product && (
                                <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                    {client.product.name}
                                </span>
                            )}
                            <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                {openTasks.length} Open Tasks
                            </span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        {editingStatus ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                <select
                                    value={selectedStatusId}
                                    onChange={(e) => setSelectedStatusId(e.target.value)}
                                    className="mv-input"
                                    style={{ fontSize: 13, padding: '6px 32px 6px 10px', minWidth: 150 }}
                                >
                                    <option value="">No Status</option>
                                    {statuses.map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    <button onClick={() => handleUpdateStatus(selectedStatusId)} className="mv-btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}>
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
                                            background: `${client.status.color}20`,
                                            color: client.status.color,
                                            border: `1px solid ${client.status.color}40`,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => {
                                            setEditingStatus(true);
                                            setSelectedStatusId(client.statusId || '');
                                        }}
                                        title="Click to change status"
                                    >
                                        {client.status.name}
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => {
                                            setEditingStatus(true);
                                            setSelectedStatusId('');
                                        }}
                                        className="mv-badge"
                                        style={{ background: '#f3f4f6', color: 'var(--color-text-muted)', cursor: 'pointer', border: 'none' }}
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

                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Add Task / Reminder
                    </p>

                    {taskError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{taskError}</div>}

                    <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Task title (e.g. Call client about pricing)"
                            className="mv-input"
                        />

                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={2}
                            placeholder="Optional details"
                            className="mv-textarea"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                            <div>
                                <label className="mv-label">Due Date</label>
                                <input
                                    type="datetime-local"
                                    value={taskDueAt}
                                    onChange={(e) => setTaskDueAt(e.target.value)}
                                    className="mv-input"
                                />
                            </div>
                            <div>
                                <label className="mv-label">Reminder Time</label>
                                <input
                                    type="datetime-local"
                                    value={taskRemindAt}
                                    onChange={(e) => setTaskRemindAt(e.target.value)}
                                    className="mv-input"
                                />
                            </div>
                            <div>
                                <label className="mv-label">Priority</label>
                                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="mv-input">
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={submittingTask} className="mv-btn-primary">
                                {submittingTask ? 'Saving...' : 'Add Task'}
                            </button>
                        </div>
                    </form>
                </div>

                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Open Tasks ({openTasks.length})
                    </p>

                    {openTasks.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            No open tasks.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {openTasks.map((task) => {
                                const overdue = isOverdue(task.remindAt || task.dueAt);
                                return (
                                    <div key={task.id} className="mv-card" style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                                            <div style={{ flex: '1 1 280px' }}>
                                                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{task.title}</p>
                                                {task.description && (
                                                    <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>{task.description}</p>
                                                )}
                                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                                                    <span className="mv-badge" style={priorityStyle(task.priority)}>{task.priority}</span>
                                                    {task.dueAt && (
                                                        <span className="mv-badge" style={{ background: overdue ? '#fee2e2' : '#f3f4f6', color: overdue ? '#b91c1c' : 'var(--color-text-muted)' }}>
                                                            Due {formatDateTime(task.dueAt)}
                                                        </span>
                                                    )}
                                                    {task.remindAt && (
                                                        <span className="mv-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                                            Remind {formatDateTime(task.remindAt)}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                                                <button
                                                    type="button"
                                                    className="mv-btn-secondary"
                                                    disabled={updatingTaskId === task.id}
                                                    onClick={() => handleToggleTask(task.id, true)}
                                                >
                                                    Mark Done
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mv-btn-secondary"
                                                    disabled={updatingTaskId === task.id}
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fff' }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        Completed Tasks ({doneTasks.length})
                    </p>

                    {doneTasks.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            No completed tasks yet.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {doneTasks.map((task) => (
                                <div key={task.id} className="mv-card" style={{ padding: '14px 20px', opacity: 0.8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{task.title}</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                                Completed task
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="mv-btn-secondary"
                                            disabled={updatingTaskId === task.id}
                                            onClick={() => handleToggleTask(task.id, false)}
                                        >
                                            Reopen
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

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
                            <button id="submit-note-btn" type="submit" disabled={submittingNote} className="mv-btn-primary">
                                {submittingNote ? 'Saving...' : 'Add Note'}
                            </button>
                        </div>
                    </form>
                </div>

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
