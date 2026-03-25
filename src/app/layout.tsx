import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const GeistSans = Inter({ subsets: ['latin'], variable: '--font-geist-sans' })
const GeistMono = Inter({ subsets: ['latin'], variable: '--font-geist-mono' })
import { ThemeProvider } from '@/components/shared/ThemeProvider'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'DSA Patterns — Master Algorithms Through Patterns',
    template: '%s | DSA Patterns',
  },
  description: 'The premium platform for mastering Data Structures & Algorithms through pattern-based learning. Learn patterns, solve problems, ace interviews.',
  keywords: ['DSA', 'Data Structures', 'Algorithms', 'LeetCode', 'Interview Prep', 'Coding Interview'],
  authors: [{ name: 'DSA Patterns Team' }],
  creator: 'DSA Patterns',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://dsapatterns.dev',
    title: 'DSA Patterns — Master Algorithms Through Patterns',
    description: 'The premium platform for mastering Data Structures & Algorithms.',
    siteName: 'DSA Patterns',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DSA Patterns',
    description: 'Master DSA through pattern-based learning.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              className: 'glass border border-border text-foreground text-sm',
              style: {
                background: 'hsl(222 47% 6%)',
                color: 'hsl(213 31% 91%)',
                border: '1px solid hsl(222 47% 12%)',
              },
              success: {
                iconTheme: { primary: '#10b981', secondary: '#fff' }
              },
              error: {
                iconTheme: { primary: '#ef4444', secondary: '#fff' }
              }
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
