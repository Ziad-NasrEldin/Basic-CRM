import './globals.css';
import { TranslationProvider } from '@/lib/TranslationContext';

export const metadata = {
    title: 'MaVoid CRM',
    description: 'Internal client management system powered by MaVoid.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="https://mavoid.com/Logo.png" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Josefin+Sans:ital,wght@0,100..700;1,100..700&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body>
                <TranslationProvider>
                    {children}
                </TranslationProvider>
            </body>
        </html>
    );
}
