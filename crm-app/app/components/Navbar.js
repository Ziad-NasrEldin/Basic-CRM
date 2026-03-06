'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTranslation } from '@/lib/TranslationContext';

export default function Navbar() {
    const { language, toggleLanguage, translations } = useTranslation();
    const t = translations;
    const pathname = usePathname();

    const isActive = (path) => {
        if (path === '/' && pathname === '/') return true;
        if (path !== '/' && pathname.startsWith(path)) return true;
        return false;
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link href="/" className="navbar-logo">
                    <Image src="/mavoid-logo.png" alt="MaVoid" width={36} height={36} style={{ objectFit: 'contain' }} />
                    <div className="navbar-logo-text">
                        <div className="navbar-logo-word">MaVoid</div>
                        <div className="navbar-logo-sub">CRM</div>
                    </div>
                </Link>

                <div className="navbar-links">
                    <Link 
                        href="/" 
                        className={`navbar-link ${isActive('/') && !pathname.startsWith('/clients/') && !pathname.startsWith('/analytics') && !pathname.startsWith('/settings') ? 'navbar-link-active' : ''}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        {t.header.clients}
                    </Link>

                    <Link 
                        href="/analytics" 
                        className={`navbar-link ${isActive('/analytics') ? 'navbar-link-active' : ''}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="20" x2="12" y2="10"></line>
                            <line x1="18" y1="20" x2="18" y2="4"></line>
                            <line x1="6" y1="20" x2="6" y2="16"></line>
                        </svg>
                        {t.header.analytics}
                    </Link>

                    <Link 
                        href="/settings" 
                        className={`navbar-link ${isActive('/settings') ? 'navbar-link-active' : ''}`}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="3"></circle>
                            <path d="M12 1v6m0 6v6m0-6h6M6 12H0"></path>
                            <path d="M19.07 4.93l-4.24 4.24m0 5.66l4.24 4.24M4.93 19.07l4.24-4.24m5.66 0l4.24 4.24"></path>
                        </svg>
                        {t.header.settings}
                    </Link>
                </div>

                <div className="navbar-actions">
                    <button
                        onClick={toggleLanguage}
                        className="navbar-lang-btn"
                        title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        {language === 'en' ? 'ع' : 'EN'}
                    </button>

                    <Link href="/clients/new" className="navbar-cta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        {t.mainPage.newClient}
                    </Link>
                </div>
            </div>
        </nav>
    );
}
