import './globals.css';
import { TranslationProvider } from '@/lib/TranslationContext';

export const metadata = {
    title: 'MaVoid CRM',
    description: 'Internal client management system powered by MaVoid.',
    manifest: '/manifest.json',
    themeColor: '#1B6C98',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'default',
        title: 'MaVoid CRM',
    },
    icons: {
        icon: [
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 5,
        userScalable: true,
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/mavoid-logo.png" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="apple-touch-icon" href="/icon-192x192.png" />
                <meta name="theme-color" content="#1B6C98" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="MaVoid CRM" />
                <meta name="application-name" content="MaVoid CRM" />
                <meta name="msapplication-TileColor" content="#1B6C98" />
                <meta name="msapplication-config" content="/browserconfig.xml" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@200..1000&display=swap" rel="stylesheet" />
                <script src="/sw-register.js" defer></script>
            </head>
            <body>
                <TranslationProvider>
                    {children}
                </TranslationProvider>
            </body>
        </html>
    );
}
