import type React from "react";
import "@/app/globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { BookOpenIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Accounting System",
  description:
    "A minimal accounting system with chart of accounts and journal entries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="p-5">
          <div className="flex min-h-screen flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between">
                <div className="flex items-center gap-2">
                  <BookOpenIcon className="h-6 w-6" />
                  <Link href="/" className="text-xl font-bold">
                    Accounting System
                  </Link>
                </div>
                <nav className="flex items-center gap-4">
                  <Button variant="ghost" asChild>
                    <Link href="/accounts">Chart of Accounts</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href="/journal-entries">Journal Entries</Link>
                  </Button>
                </nav>
              </div>
            </header>
            <main className="flex-1">{children}</main>
            <footer className="border-t py-4">
              <div className="container flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} Accounting System
                </p>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
        </div>
      </body>
    </html>
  );
}
