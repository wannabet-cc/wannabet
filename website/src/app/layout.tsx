import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import Providers from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WannaBet Web App",
  description: "Make secure, non-custodial bets with your crypto",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🤝</text></svg>"
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <div className="mx-auto mb-52 mt-8 flex min-h-screen w-full max-w-screen-md flex-col items-center gap-4 p-2">
            <Header />
            {children}
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
