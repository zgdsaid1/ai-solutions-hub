import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'AI Solutions Hub - Empower Your Business with AI',
  description: 'Complete AI-powered business automation platform with marketing, legal, content creation, and more tools.',
  keywords: 'AI, business automation, marketing, legal, content creation, artificial intelligence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          {children}
        </div>
      </body>
    </html>
  )
}