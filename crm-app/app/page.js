'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/TranslationContext';
import Navbar from './components/Navbar';
import * as XLSX from 'xlsx';

function formatDate(dateStr, locale = 'en-US') {
    return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

function formatDateTime(dateStr, locale = 'en-US') {
    return new Date(dateStr).toLocaleString(locale, {
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
    const { language, translations } = useTranslation();
    const t = translations;
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    
    const [clients, setClients] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [reminders, setReminders] = useState([]);
    const [viewMode, setViewMode] = useState('list');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingClientId, setUpdatingClientId] = useState(null);
    const [draggedClient, setDraggedClient] = useState(null);
    const [dragOverColumn, setDragOverColumn] = useState(null);

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

    function handleDragStart(e, client) {
        setDraggedClient(client);
        e.dataTransfer.effectAllowed = 'move';
    }

    function handleDragEnd() {
        setDraggedClient(null);
        setDragOverColumn(null);
    }

    function handleDragOver(e, columnKey) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOverColumn(columnKey);
    }

    function handleDragLeave() {
        setDragOverColumn(null);
    }

    async function handleDrop(e, statusId) {
        e.preventDefault();
        setDragOverColumn(null);
        
        if (!draggedClient) return;
        
        const targetStatusId = statusId === '' ? null : parseInt(statusId);
        const currentStatusId = draggedClient.statusId || null;
        
        if (currentStatusId === targetStatusId) {
            setDraggedClient(null);
            return;
        }

        await handleStatusMove(draggedClient.id, statusId);
        setDraggedClient(null);
    }

    function handleExportToExcel() {
        if (clients.length === 0) {
            alert(language === 'ar' ? 'لا توجد بيانات للتصدير' : 'No data to export');
            return;
        }

        const excelData = clients.map((client) => ({
            [t.mainPage.table.name]: client.fullName,
            [t.mainPage.table.phone]: client.phoneNumber,
            [t.mainPage.table.status]: client.status?.name || (language === 'ar' ? 'لا توجد حالة' : 'No Status'),
            [t.mainPage.table.product]: client.product?.name || '-',
            [t.mainPage.table.tasks]: client.tasks?.length || 0,
            [t.mainPage.table.since]: formatDate(client.createdAt, locale),
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        const colWidths = [
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 20 },
            { wch: 10 },
            { wch: 15 },
        ];
        ws['!cols'] = colWidths;

        XLSX.utils.book_append_sheet(wb, ws, language === 'ar' ? 'العملاء' : 'Clients');

        const today = new Date().toISOString().split('T')[0];
        const filename = `${language === 'ar' ? 'قائمة_العملاء' : 'Clients_Export'}_${today}.xlsx`;

        XLSX.writeFile(wb, filename);
    }

    const boardColumns = [
        ...statuses.map((status) => ({
            key: `status-${status.id}`,
            title: status.name,
            color: status.color,
            clients: clients.filter((client) => client.statusId === status.id),
            statusId: String(status.id),
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
            <Navbar />

            <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <input
                        id="search-input"
                        type="text"
                        placeholder={language === 'ar' ? 'ابحث بالاسم أو الهاتف...' : 'Search by name or phone...'}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mv-input"
                        style={{ maxWidth: 420, flex: '1 1 320px' }}
                    />

                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button onClick={handleExportToExcel} className="mv-btn-secondary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                            </svg>
                            {t.mainPage.exportToExcel}
                        </button>

                        <div style={{ display: 'inline-flex', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <button
                                type="button"
                                className={viewMode === 'list' ? 'mv-btn-primary' : 'mv-btn-secondary'}
                                style={{ borderRadius: 0, border: 'none' }}
                                onClick={() => setViewMode('list')}
                            >
                                {t.mainPage.list}
                            </button>
                            <button
                                type="button"
                                className={viewMode === 'kanban' ? 'mv-btn-primary' : 'mv-btn-secondary'}
                                style={{ borderRadius: 0, border: 'none' }}
                                onClick={() => setViewMode('kanban')}
                            >
                                {t.mainPage.kanban}
                            </button>
                        </div>
                    </div>
                </div>

                {reminders.length > 0 && (
                    <div className="mv-card" style={{ marginBottom: 20, borderLeft: '4px solid #f59e0b' }}>
                        <p style={{ marginTop: 0, marginBottom: 10, fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                            {t.mainPage.reminders} ({reminders.length})
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
                                                {overdue ? t.mainPage.overdue + ': ' : ''}{reminderTime ? formatDateTime(reminderTime, locale) : t.common.loading}
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
                        {t.common.loading}
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        {search ? (language === 'ar' ? 'لا توجد عملاء مطابقة لبحثك.' : 'No clients match your search.') : (language === 'ar' ? 'لا يوجد عملاء بعد. أنشئ عميلك الأول!' : 'No clients yet. Create your first one!')}
                    </div>
                ) : viewMode === 'list' ? (
                    <div className="mv-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 900 }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.name}</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.phone}</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.status}</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.tasks}</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.product}</th>
                                        <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>{t.mainPage.table.since}</th>
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
                                                        <option value="">{t.clientDetail.noStatus}</option>
                                                        {statuses.map((status) => (
                                                            <option key={status.id} value={status.id}>{status.name}</option>
                                                        ))}
                                                    </select>
                                                </td>
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>
                                                    <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                                        {client.tasks?.length || 0} {t.mainPage.task.tasks}
                                                    </span>
                                                    {nearestTask?.dueAt && (
                                                        <p style={{ margin: '6px 0 0 0', fontSize: 11, color: isOverdue(nearestTask.dueAt) ? '#b91c1c' : 'var(--color-text-subtle)' }}>
                                                            {t.mainPage.table.since} {formatDate(nearestTask.dueAt, locale)}
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
                                                <td style={{ padding: '14px 20px', color: 'var(--color-text-subtle)', fontSize: 13 }}>{formatDate(client.createdAt, locale)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="kanban-board">
                        {boardColumns.map((column) => (
                            <div 
                                key={column.key} 
                                className={`kanban-column ${dragOverColumn === column.key ? 'kanban-column-drag-over' : ''}`}
                                style={{ borderTopColor: column.color }}
                                onDragOver={(e) => handleDragOver(e, column.key)}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, column.statusId)}
                            >
                                <div className="kanban-column-header">
                                    <h3>{column.title}</h3>
                                    <span className="mv-badge" style={{ background: `${column.color}20`, color: column.color, border: `1px solid ${column.color}40` }}>
                                        {column.clients.length}
                                    </span>
                                </div>

                                <div className="kanban-column-content">
                                    {column.clients.length === 0 ? (
                                        <p className="kanban-empty">{language === 'ar' ? 'لا توجد عملاء' : 'No clients'}</p>
                                    ) : (
                                        column.clients.map((client) => {
                                            const nearestTask = client.tasks?.find((task) => task.dueAt);
                                            return (
                                                <div 
                                                    key={client.id} 
                                                    className={`kanban-card ${draggedClient?.id === client.id ? 'kanban-card-dragging' : ''}`}
                                                    draggable
                                                    onDragStart={(e) => handleDragStart(e, client)}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <Link href={`/clients/${client.id}`} className="kanban-card-title">
                                                        {client.fullName}
                                                    </Link>
                                                    <p className="kanban-card-phone">{client.phoneNumber}</p>

                                                    <div className="kanban-card-footer">
                                                        <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                                            {client.tasks?.length || 0} {t.clientDetail.openTasks}
                                                        </span>
                                                    </div>

                                                    {nearestTask?.dueAt && (
                                                        <p className="kanban-card-due" style={{ color: isOverdue(nearestTask.dueAt) ? '#b91c1c' : 'var(--color-text-subtle)' }}>
                                                            {t.mainPage.task.nextDue} {formatDate(nearestTask.dueAt, locale)}
                                                        </p>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-subtle)', letterSpacing: '0.04em' }}>
                    {clients.length} {language === 'ar' ? (clients.length !== 1 ? 'عملاء' : 'عميل') : (clients.length !== 1 ? 'CLIENTS' : 'CLIENT')}
                </p>
            </main>
        </div>
    );
}
