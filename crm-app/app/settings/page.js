'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
}

export default function SettingsPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [newProductName, setNewProductName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [productError, setProductError] = useState('');

    async function fetchProducts() {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/products');
            if (!res.ok) throw new Error('Failed to load products');
            setProducts(await res.json());
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
        if (!newProductName.trim()) { setProductError('Product name is required.'); return; }

        setSubmitting(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newProductName }),
            });
            const data = await res.json();
            if (!res.ok) { setProductError(data.error || 'Failed to add product.'); return; }
            setNewProductName('');
            fetchProducts();
        } catch {
            setProductError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDeleteProduct(id) {
        if (!confirm('Are you sure you want to delete this product? Clients linked to it will lose their product link.')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete product');
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
                        <Link href="/" className="mv-back">← Clients</Link>
                        <div style={{ width: 1, height: 20, background: 'var(--color-border)' }} />
                        <span className="mv-page-title">Settings</span>
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
                        Manage Products
                    </p>
                    <p style={{ fontSize: 13, color: 'var(--color-text-subtle)', marginBottom: 20, lineHeight: 1.5 }}>
                        These products will be available as a dropdown option when creating or editing a client.
                    </p>

                    {productError && <div className="mv-alert-error" style={{ marginBottom: 14 }}>{productError}</div>}

                    <form onSubmit={handleAddProduct} style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                        <input
                            type="text"
                            value={newProductName}
                            onChange={(e) => setNewProductName(e.target.value)}
                            placeholder="E.g. Website Development"
                            className="mv-input"
                            style={{ flex: 1 }}
                        />
                        <button type="submit" disabled={submitting} className="mv-btn-primary">
                            {submitting ? 'Adding...' : 'Add Product'}
                        </button>
                    </form>

                    <hr className="mv-divider" style={{ marginBottom: 24 }} />

                    {error ? (
                        <div className="mv-alert-error">{error}</div>
                    ) : loading ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>Loading products...</div>
                    ) : products.length === 0 ? (
                        <div style={{ color: 'var(--color-text-subtle)', fontSize: 13, textAlign: 'center' }}>No products added yet. Add your first one above.</div>
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
                                                {formatDate(product.createdAt)}
                                            </td>
                                            <td style={{ padding: '12px 16px', textAlign: 'right', width: 60 }}>
                                                <button
                                                    onClick={() => handleDeleteProduct(product.id)}
                                                    style={{ background: 'transparent', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', outline: 'none', padding: '4px 8px', borderRadius: 4 }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                                >
                                                    Delete
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
