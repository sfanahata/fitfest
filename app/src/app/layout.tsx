import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/SessionProviderWrapper";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FitFest - Fitness Tracker",
  description: "Track your fitness journey with FitFest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <NavBar />
          <main className="min-h-screen bg-gray-50">
            {children}
          </main>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
