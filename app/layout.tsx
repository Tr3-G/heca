import type { Metadata } from 'next';
import './globals.css';
import './heca.css';
import 'react-loading-skeleton/dist/skeleton.css';

export const metadata: Metadata = {
  title: 'Her Excellence Conference & Awards 2027 — Abuja Edition',
  description:
    'Her Excellence Conference & Awards 2027 (Abuja Edition) — Celebrating 50 Outstanding Women of Excellence in Nigeria. Saturday, 20 March 2027 at Wells Carlton Hotel & Apartment Abuja.',
  icons: {
    icon: '/assets/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Work+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
