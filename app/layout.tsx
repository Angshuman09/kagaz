import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import ConvexClientProvider from "@/components/ConvexClientProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
//@ts-ignore
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kagaz",
  description: "Smart note-taking editor",
  icons:"/logo.png",
  openGraph: {
    title: "Kagaz",
    description: "Smart note-taking editor",
    url: "https://kagaz-notes.vercel.app",
    siteName: "Kagaz",
    images: [
      {
        url: "/home-page.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Kagaz",
    description: "Smart note-taking editor",
    images: ["/home-page.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} antialiased font-sans`}
        style={{ fontFamily: "var(--font-inter)" }}
      >
        <ClerkProvider dynamic>
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </ClerkProvider>
        <Toaster />
      </body>
    </html>
  );
}
