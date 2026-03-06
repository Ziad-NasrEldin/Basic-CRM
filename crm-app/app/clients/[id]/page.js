'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/TranslationContext';

function formatDateTime(dateStr, locale = 'en-US') {
    return new Date(dateStr).toLocaleString(locale, {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

    async function handleAddPayment(e) {
        e.preventDefault();
        setPaymentError('');

        if (!paymentAmount || parseFloat(paymentAmount) <= 0) {
            setPaymentError(t.clientDetail.errors.paymentAmountRequired);
            return;
        }
        if (!paymentDate) {
            setPaymentError(t.clientDetail.errors.paymentDateRequired);
            return;
        }

        setSubmittingPayment(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: id,
                    amount: parseFloat(paymentAmount),
                    paidAt: paymentDate,
                    note: paymentNote.trim() || null,
                }),
            });
            if (!res.ok) throw new Error(t.clientDetail.errors.paymentCreationFailed);
            await fetchClient();
            setPaymentAmount('');
            setPaymentDate('');
            setPaymentNote('');
        } catch (err) {
            setPaymentError(err.message);
        } finally {
            setSubmittingPayment(false);
        }
    }

    async function handleDeletePayment(paymentId) {
        if (!confirm(t.common.deleteConfirm)) return;

        setDeletingPaymentId(paymentId);
        try {
            const res = await fetch(`/api/payments/${paymentId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t.clientDetail.errors.paymentDeletionFailed);
            await fetchClient();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingPaymentId(null);
        }
    }

function formatDate(dateStr, locale = 'en-US') {
    return new Date(dateStr).toLocaleDateString(locale, {
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
    const router = useRouter();
    const { language, translations } = useTranslation();
    const t = translations;
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [editingDetails, setEditingDetails] = useState(false);
    const [editFullName, setEditFullName] = useState('');
    const [editPhoneNumber, setEditPhoneNumber] = useState('');
    const [editProductId, setEditProductId] = useState('');
        const [editSaleValue, setEditSaleValue] = useState('');
    const [products, setProducts] = useState([]);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [editError, setEditError] = useState('');
    const [deletingClient, setDeletingClient] = useState(false);

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

    const [paymentAmount, setPaymentAmount] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentNote, setPaymentNote] = useState('');
    const [submittingPayment, setSubmittingPayment] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [deletingPaymentId, setDeletingPaymentId] = useState(null);

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

        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => setProducts(data))
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

    function handleEditDetailsOpen() {
        setEditFullName(client.fullName);
        setEditPhoneNumber(client.phoneNumber);
        setEditProductId(client.productId || '');
            setEditSaleValue(client.saleValue ? parseFloat(client.saleValue).toString() : '');
        setEditError('');
        setEditingDetails(true);
    }

    async function handleEditDetailsSave(e) {
        e.preventDefault();
        setEditError('');

        if (!editFullName.trim()) {
            setEditError('Full name is required.');
            return;
        }
        if (!editPhoneNumber.trim()) {
            setEditError('Phone number is required.');
            return;
        }

        setSubmittingEdit(true);
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: editFullName.trim(),
                    phoneNumber: editPhoneNumber.trim(),
                    productId: editProductId || null,
                                    saleValue: editSaleValue || null,
                }),
            });
            if (!res.ok) throw new Error('Failed to update client');
            await fetchClient();
            setEditingDetails(false);
        } catch (err) {
            setEditError(err.message);
        } finally {
            setSubmittingEdit(false);
        }
    }

    function handleEditDetailsCancel() {
        setEditingDetails(false);
        setEditError('');
    }

    async function handleDeleteClient() {
        if (!confirm(t.common.deleteConfirm)) return;

        setDeletingClient(true);
        try {
            const res = await fetch(`/api/clients/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t.clientDetail.errors.deleteFailed);
            router.push('/');
        } catch (err) {
            alert(err.message);
        } finally {
            setDeletingClient(false);
        }
    }

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                {t.common.loading}
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                <p style={{ color: '#b91c1c', fontSize: 14 }}>{error}</p>
                <Link href="/" style={{ color: 'var(--color-primary)', fontSize: 14 }}>{t.mainPage.title}</Link>
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
                        <Link href="/" className="mv-back">{t.mainPage.title}</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">{language === 'ar' ? 'تفاصيل العميل' : 'Client Details'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                        <Link href="/settings" className="mv-back" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t.header.settings}</Link>
                        <Link href="/" className="mv-logo">
                            <Image src="/mavoid-logo.png" alt="MaVoid" width={28} height={28} style={{ objectFit: 'contain' }} />
                            <span className="mv-logo-word" style={{ fontSize: 15 }}>MaVoid</span>
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 880, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {editingDetails ? (
                    <div className="mv-card">
                        <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                            {t.clientDetail.editDetails}
                        </p>

                        {editError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{editError}</div>}

                        <form onSubmit={handleEditDetailsSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label className="mv-label">{t.clientDetail.fullName}</label>
                                <input
                                    type="text"
                                    value={editFullName}
                                    onChange={(e) => setEditFullName(e.target.value)}
                                    className="mv-input"
                                    placeholder={t.clientDetail.fullNamePlaceholder}
                                />
                            </div>

                            <div>
                                <label className="mv-label">{t.clientDetail.phoneNumber}</label>
                                <input
                                    type="text"
                                    value={editPhoneNumber}
                                    onChange={(e) => setEditPhoneNumber(e.target.value)}
                                    className="mv-input"
                                    placeholder={t.clientDetail.phonePlaceholder}
                                />
                            </div>

                            <div>
                                <label className="mv-label">{t.clientDetail.product} {t.clientDetail.optional}</label>
                                <select
                                    value={editProductId}
                                    onChange={(e) => setEditProductId(e.target.value)}
                                    className="mv-input"
                                >
                                    <option value="">{t.clientDetail.noProduct}</option>
                                    {products.map((p) => (
                                        <option key={p.id} value={p.id}>{p.name}</option>
                                    ))}
                                </select>

                                                        <div>
                                                            <label className="mv-label">{t.clientDetail.saleValue} {t.clientDetail.optional}</label>
                                                            <input
                                                                type="number"
                                                                step="0.01"
                                                                min="0"
                                                                value={editSaleValue}
                                                                onChange={(e) => setEditSaleValue(e.target.value)}
                                                                className="mv-input"
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <button type="submit" disabled={submittingEdit} className="mv-btn-primary">
                                    {submittingEdit ? t.clientDetail.saving : t.clientDetail.save}
                                </button>
                                <button
                                    type="button"
                                    disabled={submittingEdit}
                                    className="mv-btn-secondary"
                                    onClick={handleEditDetailsCancel}
                                >
                                    {t.clientDetail.cancel}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="mv-card" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                        <div>
                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                                {t.clientDetail.client}
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

                                                {/* Payments Section */}
                                                {client.saleValue && (
                                                    <>
                                                        <div className="mv-card" style={{ background: '#f0f9ff', borderColor: '#bae6fd' }}>
                                                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                                                                {t.clientDetail.saleValue}
                                                            </p>
                                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '0 0 4px 0' }}>{t.clientDetail.saleValue}</p>
                                                                    <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>
                                                                        {parseFloat(client.saleValue).toLocaleString(locale, { minimumFractionDigits: 2 })}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '0 0 4px 0' }}>{t.clientDetail.totalPaid}</p>
                                                                    <p style={{ fontSize: 20, fontWeight: 700, color: '#059669', margin: 0 }}>
                                                                        {(client.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0).toLocaleString(locale, { minimumFractionDigits: 2 })}
                                                                    </p>
                                                                </div>
                                                                <div>
                                                                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', margin: '0 0 4px 0' }}>{t.clientDetail.remaining}</p>
                                                                    <p style={{ fontSize: 20, fontWeight: 700, color: '#dc2626', margin: 0 }}>
                                                                        {(parseFloat(client.saleValue) - (client.payments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0)).toLocaleString(locale, { minimumFractionDigits: 2 })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="mv-card">
                                                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                                                                {t.clientDetail.addPayment}
                                                            </p>

                                                            {paymentError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{paymentError}</div>}

                                                            <form onSubmit={handleAddPayment} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                                                                    <div>
                                                                        <label className="mv-label">{t.clientDetail.paymentAmount}</label>
                                                                        <input
                                                                            type="number"
                                                                            step="0.01"
                                                                            min="0"
                                                                            value={paymentAmount}
                                                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                                                            placeholder="0.00"
                                                                            className="mv-input"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="mv-label">{t.clientDetail.paymentDate}</label>
                                                                        <input
                                                                            type="datetime-local"
                                                                            value={paymentDate}
                                                                            onChange={(e) => setPaymentDate(e.target.value)}
                                                                            className="mv-input"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div>
                                                                    <label className="mv-label">{t.clientDetail.paymentNote}</label>
                                                                    <input
                                                                        type="text"
                                                                        value={paymentNote}
                                                                        onChange={(e) => setPaymentNote(e.target.value)}
                                                                        placeholder={language === 'ar' ? 'ملاحظة عن الدفعة...' : 'Note about this payment...'}
                                                                        className="mv-input"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <button type="submit" disabled={submittingPayment} className="mv-btn-primary">
                                                                        {submittingPayment ? t.clientDetail.saving : t.clientDetail.recordPayment}
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </div>

                                                        <div>
                                                            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                                                                {t.clientDetail.payments} ({client.payments?.length || 0})
                                                            </p>

                                                            {(!client.payments || client.payments.length === 0) ? (
                                                                <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                                                                    {t.clientDetail.noPayments}
                                                                </div>
                                                            ) : (
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                                                    {client.payments.map((payment) => (
                                                                        <div key={payment.id} className="mv-card" style={{ padding: '16px 20px' }}>
                                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 12 }}>
                                                                                <div style={{ flex: 1 }}>
                                                                                    <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#059669' }}>
                                                                                        {parseFloat(payment.amount).toLocaleString(locale, { minimumFractionDigits: 2 })}
                                                                                    </p>
                                                                                    <p style={{ margin: '6px 0 0 0', fontSize: 13, color: 'var(--color-text-muted)' }}>
                                                                                        {t.clientDetail.paid} {t.clientDetail.on} {formatDateTime(payment.paidAt, locale)}
                                                                                    </p>
                                                                                    {payment.note && (
                                                                                        <p style={{ margin: '8px 0 0 0', fontSize: 13, color: 'var(--color-text)', fontStyle: 'italic' }}>
                                                                                            {payment.note}
                                                                                        </p>
                                                                                    )}
                                                                                </div>
                                                                                <button
                                                                                    type="button"
                                                                                    className="mv-btn-secondary"
                                                                                    style={{ fontSize: 12, padding: '6px 12px' }}
                                                                                    disabled={deletingPaymentId === payment.id}
                                                                                    onClick={() => handleDeletePayment(payment.id)}
                                                                                >
                                                                                    {t.clientDetail.deletePayment}
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                <span className="mv-badge" style={{ background: '#f3f4f6', color: 'var(--color-text-muted)' }}>
                                    {openTasks.length} {t.clientDetail.openTasks}
                                </span>
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'flex-end' }}>
                            <div>
                                {editingStatus ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                                        <select
                                            value={selectedStatusId}
                                            onChange={(e) => setSelectedStatusId(e.target.value)}
                                            className="mv-input"
                                            style={{ fontSize: 13, padding: '6px 32px 6px 10px', minWidth: 150 }}
                                        >
                                            <option value="">{t.clientDetail.noStatus}</option>
                                            {statuses.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <div style={{ display: 'flex', gap: 6 }}>
                                            <button onClick={() => handleUpdateStatus(selectedStatusId)} className="mv-btn-primary" style={{ fontSize: 12, padding: '5px 12px' }}>
                                                {t.clientDetail.save}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingStatus(false);
                                                    setSelectedStatusId(client.statusId || '');
                                                }}
                                                className="mv-btn-secondary"
                                                style={{ fontSize: 12, padding: '5px 12px' }}
                                            >
                                                {t.clientDetail.cancel}
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
                                                title={language === 'ar' ? 'انقر لتغيير الحالة' : 'Click to change status'}
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
                                                {t.clientDetail.addStatus}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: 6 }}>
                                <button
                                    type="button"
                                    className="mv-btn-secondary"
                                    onClick={handleEditDetailsOpen}
                                    style={{ fontSize: 12, padding: '5px 12px' }}
                                >
                                    {t.clientDetail.edit}
                                </button>
                                <button
                                    type="button"
                                    className="mv-btn-secondary"
                                    onClick={handleDeleteClient}
                                    disabled={deletingClient}
                                    style={{ fontSize: 12, padding: '5px 12px', color: '#b91c1c', borderColor: '#fecaca' }}
                                >
                                    {deletingClient ? t.clientDetail.deleting : t.clientDetail.delete}
                                </button>
                            </div>

                            <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', margin: 0 }}>
                                {t.clientDetail.since} {formatDate(client.createdAt, locale)}
                            </p>
                        </div>
                    </div>
                )}

                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {t.clientDetail.addTask}
                    </p>

                    {taskError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{taskError}</div>}

                    <form onSubmit={handleAddTask} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <input
                            type="text"
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder={t.clientDetail.taskTitle}
                            className="mv-input"
                        />

                        <textarea
                            value={taskDescription}
                            onChange={(e) => setTaskDescription(e.target.value)}
                            rows={2}
                            placeholder={t.clientDetail.taskDescription}
                            className="mv-textarea"
                        />

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
                            <div>
                                <label className="mv-label">{t.clientDetail.dueDate}</label>
                                <input
                                    type="datetime-local"
                                    value={taskDueAt}
                                    onChange={(e) => setTaskDueAt(e.target.value)}
                                    className="mv-input"
                                />
                            </div>
                            <div>
                                <label className="mv-label">{t.clientDetail.remindDate}</label>
                                <input
                                    type="datetime-local"
                                    value={taskRemindAt}
                                    onChange={(e) => setTaskRemindAt(e.target.value)}
                                    className="mv-input"
                                />
                            </div>
                            <div>
                                <label className="mv-label">{t.clientDetail.priority}</label>
                                <select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value)} className="mv-input">
                                    <option value="low">{t.clientDetail.low}</option>
                                    <option value="medium">{t.clientDetail.medium}</option>
                                    <option value="high">{t.clientDetail.high}</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={submittingTask} className="mv-btn-primary">
                                {submittingTask ? t.clientDetail.saving : t.clientDetail.createTask}
                            </button>
                        </div>
                    </form>
                </div>

                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {t.clientDetail.openTask} ({openTasks.length})
                    </p>

                    {openTasks.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            {language === 'ar' ? 'لا توجد مهام معلقة.' : 'No open tasks.'}
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
                                                            {language === 'ar' ? 'يستحق: ' : 'Due: '}{formatDateTime(task.dueAt, locale)}
                                                        </span>
                                                    )}
                                                    {task.remindAt && (
                                                        <span className="mv-badge" style={{ background: '#eff6ff', color: '#1d4ed8' }}>
                                                            {language === 'ar' ? 'ذكرني: ' : 'Remind: '}{formatDateTime(task.remindAt, locale)}
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
                                                    {t.clientDetail.markDone}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="mv-btn-secondary"
                                                    disabled={updatingTaskId === task.id}
                                                    onClick={() => handleDeleteTask(task.id)}
                                                    style={{ color: '#b91c1c', borderColor: '#fecaca', background: '#fff' }}
                                                >
                                                    {t.clientDetail.deleteTask}
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
                        {t.clientDetail.completedTasks} ({doneTasks.length})
                    </p>

                    {doneTasks.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            {language === 'ar' ? 'لا توجد مهام مكتملة بعد.' : 'No completed tasks yet.'}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {doneTasks.map((task) => (
                                <div key={task.id} className="mv-card" style={{ padding: '14px 20px', opacity: 0.8 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>{task.title}</p>
                                            <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                                {language === 'ar' ? 'مهمة مكتملة' : 'Completed task'}
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            className="mv-btn-secondary"
                                            disabled={updatingTaskId === task.id}
                                            onClick={() => handleToggleTask(task.id, false)}
                                        >
                                            {t.clientDetail.markOpen}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {t.clientDetail.addNote}
                    </p>

                    {noteError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{noteError}</div>}

                    <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <textarea
                            id="note-textarea"
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            placeholder={language === 'ar' ? 'اكتب ملاحظة عن هذا العميل...' : 'Write a note about this client...'}
                            rows={4}
                            className="mv-textarea"
                        />
                        <div>
                            <button id="submit-note-btn" type="submit" disabled={submittingNote} className="mv-btn-primary">
                                {submittingNote ? t.clientDetail.saving : t.clientDetail.addNote}
                            </button>
                        </div>
                    </form>
                </div>

                <div>
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {t.clientDetail.notes} ({client.notes.length})
                    </p>

                    {client.notes.length === 0 ? (
                        <div className="mv-card" style={{ textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                            {t.clientDetail.noNotes}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {client.notes.map((note, i) => (
                                <div key={note.id} className="mv-card" style={{ padding: '16px 20px', position: 'relative' }}>
                                    {i === 0 && (
                                        <span className="mv-badge" style={{ position: 'absolute', top: 16, right: 20, fontSize: 10 }}>{language === 'ar' ? 'الأحدث' : 'Latest'}</span>
                                    )}
                                    <p style={{ fontSize: 14, color: 'var(--color-text)', margin: 0, whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                        {note.content}
                                    </p>
                                    <p style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 10, marginBottom: 0, letterSpacing: '0.03em' }}>
                                        {formatDateTime(note.createdAt, locale)}
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
