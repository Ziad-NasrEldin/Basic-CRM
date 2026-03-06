'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/TranslationContext';
import Navbar from '../../components/Navbar';

export default function NewClientPage() {
    const router = useRouter();
    const { language, translations } = useTranslation();
    const t = translations;
    
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [productId, setProductId] = useState('');
    const [products, setProducts] = useState([]);
    const [statusId, setStatusId] = useState('');
    const [statuses, setStatuses] = useState([]);
    const [saleValue, setSaleValue] = useState('');

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
        if (!fullName.trim()) { setError(t.newClient.errors.fullNameRequired); return; }
        if (!phoneNumber.trim()) { setError(t.newClient.errors.phoneRequired); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fullName, phoneNumber, productId, statusId, saleValue }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || t.newClient.errors.creationFailed); return; }
            router.push(`/clients/${data.id}`);
        } catch {
            setError(t.newClient.errors.creationFailed);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F9FAFB' }}>
            <Navbar />

            <main style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>
                {/* Section label */}
                <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                    {language === 'ar' ? 'معلومات العميل' : 'Client Information'}
                </p>

                <div className="mv-card">
                    {error && <div className="mv-alert-error" style={{ marginBottom: 20 }}>{error}</div>}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        <div>
                            <label htmlFor="fullName" className="mv-label">
                                {t.newClient.form.fullName} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder={t.newClient.form.fullNamePlaceholder}
                                className="mv-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className="mv-label">
                                {t.newClient.form.phoneNumber} <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                id="phoneNumber"
                                type="text"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder={t.newClient.form.phonePlaceholder}
                                className="mv-input"
                            />
                        </div>

                        <div>
                            <label htmlFor="product" className="mv-label">
                                {t.newClient.form.product} {t.newClient.form.productOptional}
                            </label>
                            <select
                                id="product"
                                value={productId}
                                onChange={(e) => setProductId(e.target.value)}
                                className="mv-input"
                                style={{ appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236B7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px 16px', paddingRight: 40 }}
                            >
                                <option value="">{language === 'ar' ? 'اختر منتجاً...' : 'Select a product...'}</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                            {products.length === 0 && (
                                <p style={{ margin: '6px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                    {language === 'ar' ? 'لم يتم العثور على منتجات. ' : 'No products found. '} <Link href="/settings" style={{ color: 'var(--color-primary)' }}>{language === 'ar' ? 'إدارة المنتجات في الإعدادات' : 'Manage products in Settings'}</Link>.
                                </p>
                            )}

                                                <div>
                                                    <label htmlFor="saleValue" className="mv-label">
                                                        {t.newClient.form.saleValue} {t.newClient.form.saleValueOptional}
                                                    </label>
                                                    <input
                                                        id="saleValue"
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={saleValue}
                                                        onChange={(e) => setSaleValue(e.target.value)}
                                                        placeholder={t.newClient.form.saleValuePlaceholder}
                                                        className="mv-input"
                                                    />
                                                </div>
                        </div>

                        <div>
                            <label htmlFor="status" className="mv-label">
                                {t.newClient.form.status} {t.newClient.form.statusOptional}
                            </label>
                            <select
                                id="status"
                                value={statusId}
                                onChange={(e) => setStatusId(e.target.value)}
                                className="mv-input"
                                style={{ appearance: 'none', background: '#fff url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' fill=\'%236B7280\'%3E%3Cpath fill-rule=\'evenodd\' d=\'M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z\' clip-rule=\'evenodd\'/%3E%3C/svg%3E") no-repeat right 12px center / 16px 16px', paddingRight: 40 }}
                            >
                                <option value="">{language === 'ar' ? 'اختر حالة...' : 'Select a status...'}</option>
                                {statuses.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                            {statuses.length === 0 && (
                                <p style={{ margin: '6px 0 0 0', fontSize: 11, color: 'var(--color-text-subtle)' }}>
                                    {language === 'ar' ? 'لم يتم العثور على حالات. ' : 'No statuses found. '} <Link href="/settings" style={{ color: 'var(--color-primary)' }}>{language === 'ar' ? 'إدارة الحالات في الإعدادات' : 'Manage statuses in Settings'}</Link>.
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
                                {submitting ? t.newClient.buttons.creating : t.newClient.buttons.create}
                            </button>
                            <Link href="/" className="mv-btn-secondary">{t.newClient.buttons.cancel}</Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
