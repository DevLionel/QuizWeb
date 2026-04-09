import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Geist_Mono } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Navbar } from '@/components/Navbar'
import { DataGridBackground } from '@/components/ui/data-grid-background'

const oxanium = localFont({
  src: '../stitch/font/Oxanium-VariableFont_wght.ttf',
  variable: '--font-oxanium',
  weight: '200 800',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Quiz Platform',
  description: 'Test jouw kennis met onze interactieve quiz',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl" suppressHydrationWarning>
      <body className={`${oxanium.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
          <DataGridBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <div className="pt-14">
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
