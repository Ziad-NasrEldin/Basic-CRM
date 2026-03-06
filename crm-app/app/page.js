'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(dateStr) {
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function isOverdue(dateStr) {
    if (!dateStr) return false;
    return new Date(dateStr).getTime() < Date.now();
}

function getPriorityColor(priority) {
    if (priority === 'high') return '#dc2626';
    if (priority === 'low') return '#16a34a';
    return '#d97706';
}

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingClientId, setUpdatingClientId] = useState(null);

    const fetchClients = useCallback(async (q) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/clients${q ? `?search=${encodeURIComponent(q)}` : ''}`);
            if (!res.ok) throw new Error('Failed to load clients');
            const data = await res.json();
            setClients(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchMetadata = useCallback(async () => {
        try {
            const [statusesRes, remindersRes] = await Promise.all([
                fetch('/api/client-statuses'),
                fetch('/api/tasks/reminders'),
            ]);

            if (statusesRes.ok) {
                setStatuses(await statusesRes.json());
            }
            if (remindersRes.ok) {
                setReminders(await remindersRes.json());
            }
        } catch (err) {
            console.error(err);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => fetchClients(search), 300);
        return () => clearTimeout(timer);
    }, [search, fetchClients]);

    useEffect(() => {
        fetchMetadata();
    }, [fetchMetadata]);

    async function handleStatusMove(clientId, statusId) {
        setUpdatingClientId(clientId);
        try {
            const res = await fetch(`/api/clients/${clientId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ statusId: statusId || null }),
            });
            if (!res.ok) throw new Error('Failed to update client status');
            await fetchClients(search);
            await fetchMetadata();
        } catch (err) {
            alert(err.message);
        } finally {
            setUpdatingClientId(null);
        }
    }

    const boardColumns = [
        ...statuses.map((status) => ({
            key: `status-${status.id}`,
            title: status.name,
            color: status.color,
            clients: clients.filter((client) => client.statusId === status.id),
            statusId: status.id,
        })),
        {
            key: 'status-none',
            title: 'No Status',
            color: '#6B7280',
            clients: clients.filter((client) => !client.statusId),
            statusId: '',
        },
    ];

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            <header className="mv-header">
                <div className="mv-header-inner">
                    <Link href="/" className="mv-logo">
                        <Image src="/mavoid-logo.png" alt="MaVoid" width={32} height={32} style={{ objectFit: 'contain' }} />
                        <div>
                            <div className="mv-logo-word">MaVoid</div>
                            <div className="mv-logo-sub">CRM</div>
                        </div>
                    </Link>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Link href="/settings" className="mv-back" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Settings</Link>
                        <Link href="/clients/new" id="create-client-btn" className="mv-btn-primary">
                            + New Client
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mv-input"
                        style={{ maxWidth: 420, flex: '1 1 320px' }}
                    />

                    <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                        <button
                            type="button"
                            className={viewMode === 'list' ? 'mv-btn-primary' : 'mv-btn-secondary'}
                            style={{ borderRadius: 0, border: 'none' }}
                            onClick={() => setViewMode('list')}
                        >
                            List View
                        </button>
                        <button
                            type="button"
                            className={viewMode === 'kanban' ? 'mv-btn-primary' : 'mv-btn-secondary'}
                            style={{ borderRadius: 0, border: 'none' }}
                            onClick={() => setViewMode('kanban')}
                        >
                            Kanban View
                        </button>
                    </div>
                </div>

                {reminders.length > 0 && (
                    <div className="mv-card" style={{ marginBottom: 20, borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ marginTop: 0, marginBottom: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                            Reminders Due Today ({reminders.length})
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {reminders.slice(0, 8).map((task) => {
                                const reminderTime = task.remindAt || task.dueAt;
                                const overdue = isOverdue(reminderTime);
                                return (
                                    <Link
                                        key={task.id}
                                        href={`/clients/${task.client.id}`}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            gap: 12,
                                            textDecoration: 'none',
                                            padding: '10px 12px',
                                            border: '1px solid var(--color-border)',
                                            borderRadius: 'var(--radius-sm)',
                                            background: overdue ? '#fef2f2' : '#fff',
                                        }}
                                    >
                                        <div>
                                            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text)', fontWeight: 600 }}>{task.title}</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: 'var(--color-text-muted)' }}>
                                                {task.client.fullName}
                                            </p>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <span
                                                className="mv-badge"
                                                style={{
                                                    background: `${getPriorityColor(task.priority)}20`,
                                                    color: getPriorityColor(task.priority),
                                                    border: `1px solid ${getPriorityColor(task.priority)}40`,
                                                }}
                                            >
                                                {task.priority}
                                            </span>
                                            <p style={{ margin: '6px 0 0 0', fontSize: 11, color: overdue ? '#b91c1c' : 'var(--color-text-subtle)' }}>
                                                {overdue ? 'Overdue: ' : ''}{reminderTime ? formatDateTime(reminderTime) : 'No date'}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}

                {error && <div className="mv-alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        Loading...
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        {search ? 'No clients match your search.' : 'No clients yet. Create your first one!'}
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="mv-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 900 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Client Name</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Phone</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Status</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Tasks</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Product</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>Since</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {clients.map((client, i) => {
                                        const nearestTask = client.tasks?.find((task) => task.dueAt);
                                        return (
                                            <tr
                                                key={client.id}
                                                style={{
                                                    borderBottom: i < clients.length - 1 ? '1px solid var(--color-border)' : 'none',
                                                    transition: 'background 0.1s',
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--color-primary-light)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={{ padding: '14px 20px' }}>
                                                    <Link href={`/clients/${client.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>
                                                        {client.fullName}
                                                    </Link>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{client.phoneNumber}</td>
                                                <td style={{ padding: '14px 20px' }}>
                                                    <select
                                                        value={client.statusId || ''}
                                                        onChange={(e) => handleStatusMove(client.id, e.target.value)}
                                                        className="mv-input"
                                                        disabled={updatingClientId === client.id}
                                                        style={{ fontSize: 12, padding: '6px 28px 6px 10px' }}
                                                    >
                                                        <option value="">No Status</option>
                                                        {statuses.map((status) => (
                                                            <option key={status.id} value={status.id}>{status.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>
                                                    <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                                        {client.tasks?.length || 0} Open
                                                    </span>
                                                    {nearestTask?.dueAt && (
                                                        <p style={{ margin: '6px 0 0 0', fontSize: 11, color: isOverdue(nearestTask.dueAt) ? '#b91c1c' : 'var(--color-text-subtle)' }}>
                                                            Due {formatDate(nearestTask.dueAt)}
                                                        </p>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>
                                                    {client.product ? (
                                                        <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                                            {client.product.name}
                                                        </span>
                                                    ) : (
                                                        <span style={{ color: 'var(--color-text-subtle)' }}>—</span>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-subtle)', fontSize: 13 }}>{formatDate(client.createdAt)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 14 }}>
                        {boardColumns.map((column) => (
                            <div key={column.key} className="mv-card" style={{ padding: 14, minHeight: 260, borderTop: `4px solid ${column.color}` }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-text)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                                        {column.title}
                                    </h3>
                                    <span className="mv-badge" style={{ background: `${column.color}20`, color: column.color, border: `1px solid ${column.color}40` }}>
                                        {column.clients.length}
                                    </span>
                                </div>

                                {column.clients.length === 0 ? (
                                    <p style={{ margin: 0, fontSize: 12, color: 'var(--color-text-subtle)' }}>No clients</p>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        {column.clients.map((client) => {
                                            const nearestTask = client.tasks?.find((task) => task.dueAt);
                                            return (
                                                <div key={client.id} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: 10, background: '#fff' }}>
                                                    <Link href={`/clients/${client.id}`} style={{ textDecoration: 'none', color: 'var(--color-primary)', fontWeight: 700, fontSize: 14 }}>
                                                        {client.fullName}
                                                    </Link>
                                                    <p style={{ margin: '4px 0 8px 0', fontSize: 12, color: 'var(--color-text-muted)' }}>{client.phoneNumber}</p>

                                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                                        <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                                            {client.tasks?.length || 0} Open Tasks
                                                        </span>
                                                        <select
                                                            value={client.statusId || ''}
                                                            onChange={(e) => handleStatusMove(client.id, e.target.value)}
                                                            className="mv-input"
                                                            disabled={updatingClientId === client.id}
                                                            style={{ fontSize: 11, padding: '4px 22px 4px 8px', maxWidth: 120 }}
                                                        >
                                                            <option value="">No Status</option>
                                                            {statuses.map((status) => (
                                                                <option key={status.id} value={status.id}>{status.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>

                                                    {nearestTask?.dueAt && (
                                                        <p style={{ margin: '8px 0 0 0', fontSize: 11, color: isOverdue(nearestTask.dueAt) ? '#b91c1c' : 'var(--color-text-subtle)' }}>
                                                            Next due: {formatDate(nearestTask.dueAt)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-subtle)', letterSpacing: '0.04em' }}>
                    {clients.length} CLIENT{clients.length !== 1 ? 'S' : ''}
                </p>
            </main>
        </div>
    );
}
