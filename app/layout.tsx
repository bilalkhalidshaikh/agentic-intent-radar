import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Achroweb Lead Sniper',
  description: 'High-end, data-dense, ultra-premium SaaS dashboard for an AI Voice Agency.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body suppressHydrationWarning className="bg-zinc-950 text-zinc-100 font-sans antialiased">{children}</body>
    </html>
  );
}
