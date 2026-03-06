'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/lib/TranslationContext';
import Navbar from '../components/Navbar';

export default function AnalyticsPage() {
    const { language, translations } = useTranslation();
    const t = translations;
    const locale = language === 'ar' ? 'ar-SA' : 'en-US';

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/analytics')
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    setError(data.error);
                } else {
                    setData(data);
                }
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    const formatCurrency = (value) => {
        return parseFloat(value).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const getMonthName = (monthNumber) => {
        const date = new Date(2000, monthNumber - 1, 1);
        return date.toLocaleDateString(locale, { month: 'long' });
    };

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

    return (
        <div className="analytics-page">
            <Navbar />

            <main className="analytics-main">
                <section className="analytics-overview">
                    <div className="analytics-card analytics-total-card">
                        <p className="analytics-label">{t.analytics.totalSaleValue}</p>
                        <h2 className="analytics-value analytics-value-primary">{formatCurrency(data.totalSaleValue)}</h2>
                        <p className="analytics-meta">{data.clientsWithSaleValueCount} {t.analytics.clientsWithSales}</p>
                    </div>

                    <div className="analytics-card analytics-paid-card">
                        <p className="analytics-label">{t.analytics.totalReceived}</p>
                        <h2 className="analytics-value analytics-value-success">{formatCurrency(data.totalPaid)}</h2>
                        <p className="analytics-meta">{data.monthlyData.length} {t.analytics.monthsActive}</p>
                    </div>

                    <div className="analytics-card analytics-remaining-card">
                        <p className="analytics-label">{t.analytics.totalRemaining}</p>
                        <h2 className="analytics-value analytics-value-warning">{formatCurrency(data.totalRemaining)}</h2>
                        <p className="analytics-meta">
                            {data.totalSaleValue > 0 
                                ? `${((data.totalPaid / data.totalSaleValue) * 100).toFixed(1)}% ${t.analytics.collected}`
                                : '0% collected'}
                        </p>
                    </div>

                    <div className="analytics-card analytics-avg-card">
                        <p className="analytics-label">{t.analytics.avgPerMonth}</p>
                        <h2 className="analytics-value analytics-value-neutral">{formatCurrency(data.averagePaymentPerMonth)}</h2>
                        <p className="analytics-meta">{t.analytics.average}</p>
                    </div>
                </section>

                <section className="mv-card" style={{ marginTop: 24 }}>
                    <h3 className="analytics-section-title">{t.analytics.monthlyRevenue}</h3>
                    
                    {data.monthlyData.length === 0 ? (
                        <div className="cd-empty-block">{t.analytics.noPayments}</div>
                    ) : (
                        <div className="analytics-monthly-list">
                            {data.monthlyData.map((month) => (
                                <div key={month.month} className="analytics-month-item">
                                    <div className="analytics-month-header">
                                        <div>
                                            <h4 className="analytics-month-name">
                                                {getMonthName(month.monthNumber)} {month.year}
                                            </h4>
                                            <p className="analytics-month-count">
                                                {month.count} {month.count === 1 ? t.analytics.payment : t.analytics.payments}
                                            </p>
                                        </div>
                                        <div className="analytics-month-total">
                                            {formatCurrency(month.total)}
                                        </div>
                                    </div>

                                    {/* Bar chart visualization */}
                                    <div className="analytics-bar-container">
                                        <div 
                                            className="analytics-bar"
                                            style={{
                                                width: `${Math.min((month.total / data.totalPaid) * 100, 100)}%`
                                            }}
                                        />
                                    </div>

                                    {/* Payment details */}
                                    <details className="analytics-month-details">
                                        <summary className="analytics-details-summary">
                                            {t.analytics.viewDetails}
                                        </summary>
                                        <div className="analytics-payments-list">
                                            {month.payments.map((payment) => (
                                                <div key={payment.id} className="analytics-payment-item">
                                                    <div>
                                                        <Link 
                                                            href={`/clients/${payment.clientId}`}
                                                            className="analytics-client-link"
                                                        >
                                                            {payment.clientName}
                                                        </Link>
                                                        <p className="analytics-payment-date">
                                                            {new Date(payment.paidAt).toLocaleDateString(locale, {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                    <span className="analytics-payment-amount">
                                                        {formatCurrency(payment.amount)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
