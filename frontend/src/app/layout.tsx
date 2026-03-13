import type {Metadata} from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; 
import { Analytics } from '@vercel/analytics/nuxt/runtime';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Cal.com Clone',
  description: 'A pixel-perfect clone of the Cal.com marketing landing page.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable}`}>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
      <Analytics />
    </html>
  );
}
