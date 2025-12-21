import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ThemeProvider } from "@/components/theme-provider";

const publicSans = Public_Sans({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: "Helvety PDF | Comprehensive PDF Tool | Private and Secure",
  description: "Manage PDF files with ease. Merge, reorder, delete, rotate, and extract PDF pages - all in one place. All processing happens locally in your browser. Your files never leave your device. Private, secure, and free.",
  keywords: ["PDF manager", "PDF merge", "PDF reorder", "PDF delete", "PDF rotate", "PDF extract", "client-side PDF", "privacy PDF tool", "secure PDF", "browser PDF", "PDF editor"],
  authors: [{ name: "Helvety" }],
  icons: {
    icon: "/helvety_Identifier_whiteBg.svg",
    apple: "/helvety_Identifier_whiteBg.svg",
  },
  openGraph: {
    title: "Helvety PDF | Comprehensive PDF Tool | Private and Secure",
    description: "Manage PDF files with ease. Merge, reorder, delete, rotate, and extract PDF pages - all in one place. All processing happens locally.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helvety PDF | Comprehensive PDF Tool | Private and Secure",
    description: "Manage PDF files with ease. Merge, reorder, delete, rotate, and extract PDF pages - all in one place. All processing happens locally.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
