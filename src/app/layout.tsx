import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Airport Transfers — Book Your Ride",
  description: "Premium airport transfer booking service",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
