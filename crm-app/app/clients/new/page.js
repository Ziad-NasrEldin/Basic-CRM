'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function NewClientPage() {
    const router = useRouter();
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [productId, setProductId] = useState('');
    const [products, setProducts] = useState([]);
    const [statusId, setStatusId] = useState('');
    const [statuses, setStatuses] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            fetch('/api/products').then(res => res.json()),
            fetch('/api/client-statuses').then(res => res.json())
        ])
            .then(([productsData, statusesData]) => {
                setProducts(productsData);
                setStatuses(statusesData);
            })
            .catch(console.error);
    }, []);

    async function handleSubmit(e) {
        e.preventDefault();
        setError('');
        if (!fullName.trim()) { setError('Full name is required.'); return; }
        if (!phoneNumber.trim()) { setError('Phone number is required.'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, phoneNumber, productId, statusId }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to create client.'); return; }
            router.push(`/clients/${data.id}`);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            {/* Header */}
            <header className="mv-header">
                <div className="mv-header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/" className="mv-back">← Clients</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">New Client</span>
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

            <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
                {/* Section label */}
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    Client Information
                </p>

                <div className="mv-card">
                    {error && <div className="mv-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label htmlFor="fullName" className="mv-label">
                                Full Name <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Ahmed Hassan"
                                className="mv-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="mv-label">
                                Phone Number <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="phoneNumber"
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="e.g. +20 100 000 0000"
                                className="mv-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="product" className="mv-label">
                                Requested Product (Optional)
                            </label>
                            <select
                                id="product"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="mv-input"
                                style={{ appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236B7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px 16px', paddingRight: 40 }}
                            >
                                <option value="">Select a product...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {products.length === 0 && (
                                <p style={{ margin: '6px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                    No products found. <Link href="/settings" style={{ color: 'var(--color-primary)' }}>Manage products in Settings</Link>.
                                </p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="status" className="mv-label">
                                Client Status (Optional)
                            </label>
                            <select
                                id="status"
                                value={statusId}
                                onChange={(e) => setStatusId(e.target.value)}
                                className="mv-input"
                                style={{ appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236B7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px 16px', paddingRight: 40 }}
                            >
                                <option value="">Select a status...</option>
                                {statuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {statuses.length === 0 && (
                                <p style={{ margin: '6px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                    No statuses found. <Link href="/settings" style={{ color: 'var(--color-primary)' }}>Manage statuses in Settings</Link>.
                                </p>
                            )}
                        </div>

                        <hr className="mv-divider" />

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button
                                id="submit-client-btn"
                                type="submit"
                                disabled={submitting}
                                className="mv-btn-primary"
                            >
                                {submitting ? 'Saving...' : 'Create Client'}
                            </button>
                            <Link href="/" className="mv-btn-secondary">Cancel</Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
