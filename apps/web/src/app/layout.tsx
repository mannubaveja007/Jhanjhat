import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";

export const metadata: Metadata = {
  title: "Jhanjhat | Freelance Commercial Intelligence & Voice Sparring",
  description: "Deterministic contract scoping, real-time budget burn tracking, and voice sparring with AI client personas.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark overflow-x-clip">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-surface-muted selection:text-foreground overflow-x-clip">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
