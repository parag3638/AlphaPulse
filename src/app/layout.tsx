import type { Metadata } from "next";
import localFont from "next/font/local";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "AlphaPulse",
  description: "What you are seeking is seeking you.",
  icons: { icon: "/icon.ico", }
};

// Load GeistVF (Variable Font)
const geistVF = localFont({
  src: [
    {
      path: "../assets/fonts/GeistVF.woff",
      weight: "100 900", // Variable font range
      style: "normal",
    },
  ],
  variable: "--font-geist", // Create a CSS variable
  display: "swap",
});

// Load GeistMonoVF (Variable Font)
const geistMonoVF = localFont({
  src: [
    {
      path: "../assets/fonts/GeistMonoVF.woff",
      weight: "100 900", // Variable font range
      style: "normal",
    },
  ],
  variable: "--font-geist-mono", // Create a CSS variable
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistVF.variable} ${geistMonoVF.variable}`}>
      <body className="antialiased">
        <main> {children}</main>
        <Toaster />
      </body>
    </html>
  );
}
