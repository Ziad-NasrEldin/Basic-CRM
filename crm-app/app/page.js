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

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    useEffect(() => {
        const timer = setTimeout(() => fetchClients(search), 300);
        return () => clearTimeout(timer);
    }, [search, fetchClients]);

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
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
                        <Link href="/settings" className="mv-back" style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>⚙️ Settings</Link>
                        <Link href="/clients/new" id="create-client-btn" className="mv-btn-primary">
                            + New Client
                        </Link>
                    </div>
                </div>
            </header>

            <main style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
                {/* Search */}
                <div style={{ marginBottom: 24 }}>
                    <input
                        id="search-input"
                        type="text"
                        placeholder="Search by name or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="mv-input"
                        style={{ maxWidth: 400 }}
                    />
                </div>

                {error && <div className="mv-alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        Loading...
                    </div>
                ) : clients.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-subtle)', fontSize: 13 }}>
                        {search ? 'No clients match your search.' : 'No clients yet. Create your first one!'}
                    </div>
                ) : (
                    <div className="mv-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--color-border)', background: 'var(--color-surface)' }}>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                                        Client Name
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                                        Phone
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                                        Status
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                                        Product
                                    </th>
                                    <th style={{ padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                                        Since
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {clients.map((client, i) => (
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
                                            <Link
                                                href={`/clients/${client.id}`}
                                                style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                                            >
                                                {client.fullName}
                                            </Link>
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>{client.phoneNumber}</td>
                                        <td style={{ padding: '14px 20px', color: 'var(--color-text-muted)' }}>
                                            {client.status ? (
                                                <span 
                                                    className="mv-badge" 
                                                    style={{ 
                                                        background: client.status.color + '20', 
                                                        color: client.status.color,
                                                        border: `1px solid ${client.status.color}40`
                                                    }}
                                                >
                                                    {client.status.name}
                                                </span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-subtle)' }}>—</span>
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
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-text-subtle)', letterSpacing: '0.04em' }}>
                    {clients.length} CLIENT{clients.length !== 1 ? 'S' : ''}
                </p>
            </main>
        </div>
    );
}
