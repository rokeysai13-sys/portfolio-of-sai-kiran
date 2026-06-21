import type { Metadata } from 'next';
import { Geist, Geist_Mono, Baloo_2, Dancing_Script } from 'next/font/google';
import './globals.css';
import Cursor from '@/components/ui/Cursor';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const baloo = Baloo_2({
  variable: '--font-baloo',
  subsets: ['latin'],
  weight: ['400', '600', '800'],
});

const dancing = Dancing_Script({
  variable: '--font-dancing',
  subsets: ['latin'],
  weight: ['400', '700'],
});

const description =
  'Portfolio of Sai Kiran Putta V.V. — AI Engineer, Machine Learning Student, and Full Stack Developer building intelligent applications, autonomous AI agents, and RAG systems.';

export const metadata: Metadata = {
  title: {
    default: 'Sai Kiran Putta V.V. | AI Engineer',
    template: '%s | Sai Kiran Putta V.V.',
  },
  description,
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  keywords: [
    'Sai Kiran Putta V.V.',
    'AI Engineer',
    'Machine Learning Student',
    'Full Stack Developer',
    'Agentic AI',
    'RAG Systems',
    'Python',
    'FastAPI',
    'React',
    'NSRIT',
  ],
  authors: [{ name: 'Sai Kiran Putta V.V.' }],
  creator: 'Sai Kiran Putta V.V.',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://cinematic-portfolio-sable.vercel.app',
    siteName: 'Sai Kiran Putta V.V.',
    title: 'Sai Kiran Putta V.V. | AI Engineer',
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sai Kiran Putta V.V. | AI Engineer',
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${baloo.variable} ${dancing.variable} h-full antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Sai Kiran Putta V.V.',
              url: 'https://cinematic-portfolio-sable.vercel.app',
              email: 'rokeysai13@gmail.com',
              jobTitle: 'AI Engineer & Full Stack Developer',
              sameAs: [
                'https://github.com/rokeysai13-sys',
                'https://www.linkedin.com/in/sai-kiran-putta-v-v-421497310',
              ],
            }),
          }}
        />
        <Cursor />
        {children}
      </body>
    </html>
  );
}
