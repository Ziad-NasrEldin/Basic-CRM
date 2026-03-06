'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from '@/lib/TranslationContext';

function formatDate(dateStr, locale = 'en-US') {
    return new Date(dateStr).toLocaleDateString(locale, {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function SettingsPage() {
    const { language, translations } = useTranslation();
    const t = translations;
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';
    
    const [products, setProducts] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newProductName, setNewProductName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [productError, setProductError] = useState('');

    const [newStatusName, setNewStatusName] = useState('');
    const [newStatusColor, setNewStatusColor] = useState('#6B7280');
    const [submittingStatus, setSubmittingStatus] = useState(false);
    const [statusError, setStatusError] = useState('');

    async function fetchProducts() {
        setLoading(true);
        setError('');
        try {
            const [productsRes, statusesRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/client-statuses')
            ]);
            if (!productsRes.ok || !statusesRes.ok) throw new Error('Failed to load data');
            setProducts(await productsRes.json());
            setStatuses(await statusesRes.json());
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProducts(); }, []);

    async function handleAddProduct(e) {
        e.preventDefault();
        setProductError('');
        if (!newProductName.trim()) { setProductError(t.settings.errors.creationFailed); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProductName }),
            });
            const data = await res.json();
            if (!res.ok) { setProductError(data.error || t.settings.errors.creationFailed); return; }
            setNewProductName('');
            fetchProducts();
        } catch {
            setProductError(t.common.error + '. ' + (language === 'ar' ? 'يرجى المحاولة مجددا.' : 'Please try again.'));
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteProduct(id) {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذا المنتج؟ العملاء المرتبطون به سيفقدون ارتباط المنتج.' : 'Are you sure you want to delete this product? Clients linked to it will lose their product link.')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t.settings.errors.deleteFailed);
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    }

    async function handleAddStatus(e) {
        e.preventDefault();
        setStatusError('');
        if (!newStatusName.trim()) { setStatusError(t.settings.errors.statusNameRequired); return; }

        setSubmittingStatus(true);
        try {
            const res = await fetch('/api/client-statuses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStatusName, color: newStatusColor }),
            });
            const data = await res.json();
            if (!res.ok) { setStatusError(data.error || t.settings.errors.creationFailed); return; }
            setNewStatusName('');
            setNewStatusColor('#6B7280');
            fetchProducts();
        } catch {
            setStatusError(t.common.error + '. ' + (language === 'ar' ? 'يرجى المحاولة مجددا.' : 'Please try again.'));
        } finally {
            setSubmittingStatus(false);
        }
    }

    async function handleDeleteStatus(id) {
        if (!confirm(language === 'ar' ? 'هل أنت متأكد أنك تريد حذف هذه الحالة؟ العملاء بهذه الحالة سيفقدون حالتهم.' : 'Are you sure you want to delete this status? Clients with this status will lose their status.')) return;
        try {
            const res = await fetch(`/api/client-statuses/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error(t.settings.errors.deleteFailed);
            fetchProducts();
        } catch (err) {
            alert(err.message);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            <header className="mv-header">
                <div className="mv-header-inner">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        <Link href="/" className="mv-back">← {t.mainPage.title}</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">{t.settings.title}</span>
                    </div>
                    <Link href="/" className="mv-logo">
                        <Image src="/mavoid-logo.png" alt="MaVoid" width={28} height={28} style={{ objectFit: 'contain' }} />
                        <span className="mv-logo-word" style={{ fontSize: 15 }}>MaVoid</span>
                    </Link>
                </div>
            </header>

            <main style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {language === 'ar' ? 'إدارة المنتجات' : 'Manage Products'}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', marginBottom: 20, lineHeight: 1.5 }}>
                        {language === 'ar' ? 'ستكون هذه المنتجات متاحة كخيار عند إنشاء أو تحرير العميل.' : 'These products will be available as a dropdown option when creating or editing a client.'}
                    </p>

                    {productError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{productError}</div>}

                    <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                        <input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: تطوير موقع ويب' : 'E.g. Website Development'}
                            className="mv-input"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" disabled={submitting} className="mv-btn-primary">
                            {submitting ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : (language === 'ar' ? 'إضافة منتج' : 'Add Product')}
                        </button>
                    </form>

                    <hr className="mv-divider" style={{ marginBottom: 24 }} />

                    {error ? (
                        <div className="mv-alert-error">{error}</div>
                    ) : loading ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>{t.common.loading}</div>
                    ) : products.length === 0 ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>{language === 'ar' ? 'لم يتم إضافة منتجات بعد. أضف أول منتج أعلاه.' : 'No products added yet. Add your first one above.'}</div>
                    ) : (
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <tbody>
                                    {products.map((product, i) => (
                                        <tr key={product.id} style={{ borderBottom: i < products.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                            <td style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--color-text)' }}>
                                                {product.name}
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--color-text-subtle)', textAlign: 'right', fontSize: 12 }}>
                                                {formatDate(product.createdAt, locale)}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', width: 60 }}>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', outline: 'none', padding: '4px 8px', borderRadius: 4 }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {t.settings.delete}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Client Status Management */}
                <div className="mv-card">
                    <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 14 }}>
                        {t.settings.clientStatuses}
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', marginBottom: 20, lineHeight: 1.5 }}>
                        {language === 'ar' ? 'ستكون هذه الحالات متاحة كخيار منسدل عند إنشاء أو تحرير العميل. أمثلة: عميل محتمل، عميل جديد، متابعة، نشط، إلخ.' : 'These statuses will be available as a dropdown option when creating or editing a client. Examples: Lead, New Customer, Follow Up, Active, etc.'}
                    </p>

                    {statusError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{statusError}</div>}

                    <form onSubmit={handleAddStatus} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                        <input
                            type="text"
                            value={newStatusName}
                            onChange={(e) => setNewStatusName(e.target.value)}
                            placeholder={language === 'ar' ? 'مثال: عميل محتمل، عميل جديد، متابعة' : 'E.g. Lead, New Customer, Follow Up'}
                            className="mv-input"
                            style={{ flex: 1 }}
                        />
                        <input
                            type="color"
                            value={newStatusColor}
                            onChange={(e) => setNewStatusColor(e.target.value)}
                            title={language === 'ar' ? 'اختر لوناً لهذه الحالة' : 'Choose a color for this status'}
                            style={{ width: 60, height: 42, border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                        />
                        <button type="submit" disabled={submittingStatus} className="mv-btn-primary">
                            {submittingStatus ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') : t.settings.add}
                        </button>
                    </form>

                    <hr className="mv-divider" style={{ marginBottom: 24 }} />

                    {loading ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>{t.common.loading}</div>
                    ) : statuses.length === 0 ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>{t.settings.noStatuses}</div>
                    ) : (
                        <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                                <tbody>
                                    {statuses.map((status, i) => (
                                        <tr key={status.id} style={{ borderBottom: i < statuses.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                                            <td style={{ padding: '12px 16px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: status.color }} />
                                                    <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>{status.name}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '12px 16px', color: 'var(--color-text-subtle)', textAlign: 'right', fontSize: 12 }}>
                                                {formatDate(status.createdAt, locale)}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', width: 60 }}>
                                                <button
                                                    onClick={() => handleDeleteStatus(status.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', outline: 'none', padding: '4px 8px', borderRadius: 4 }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    {t.settings.delete}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
