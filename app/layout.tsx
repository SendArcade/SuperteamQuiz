import type { Metadata } from "next"
import localFont from "next/font/local"
import { ThemeProvider } from "@/components/theme-provider"
import SolanaWalletProvider from "@/providers/SolanaWalletProvider"
import { Header } from '@/components/header'
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
})

export const metadata: Metadata = {
  title: "Send Arcade",
  description: "Send Arcade",
  openGraph: {
    title: "Send Arcade",
    description: "Gamifying Solana",
    url: "https://sendarcade.fun",
    siteName: "Send Arcade",
    images: [
      {
        url: "https://sendarcade.fun/banner.png",
        width: 1200,
        height: 630
      },
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Send Arcade",
    description: "Gamifying Solana",
    site: "@send_arcade",
    images: ["https://sendarcade.fun/banner.png"]
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    },
  },
  icons: {
    icon: "/favicon.ico"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SolanaWalletProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            {/* {children} */}
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex flex-col flex-1 bg-muted/50 ">{children}</main>
              <Toaster />
            </div>
          </ThemeProvider>
        </SolanaWalletProvider>
      </body>
    </html>
  )
}
