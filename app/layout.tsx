import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { RootProvider } from 'fumadocs-ui/provider/next';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'AI Open SDK',
    template: '%s | AI Open SDK',
  },
  description:
    'Provider-agnostic AI integration library for Microsoft Dynamics 365 Business Central. Structured output, tools, retries, and a mock provider, written in AL.',
  metadataBase: new URL('https://aiopensdk.dev'),
  openGraph: {
    title: 'AI Open SDK',
    description:
      'Provider-agnostic AI for Business Central. One client API across providers. Not Copilot, not a hosted service.',
    type: 'website',
  },
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-screen flex-col">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
