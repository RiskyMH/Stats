import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Nunito } from 'next/font/google'

const ptSans = Nunito({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: "Stats Compare",
    template: "%s | Stats Compare",
  },
  description: 'A website where you can compare data',
  metadataBase: new URL(process.env.BASE_URL || "https://stats.riskymh.dev/"),
  openGraph: {
    type: "website",
    siteName: "Stats Compare",
    locale: "en_US",
    images: [
      "/icon.png",
    ],
  },
  twitter: {
    card: "summary",
    images: [
      "/icon.png",
    ],
  },
} satisfies Metadata

export const viewport = {
  themeColor: "#2b2d31"
} satisfies Viewport

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${ptSans.className}`}>{children}</body>
    </html>
  )
}
