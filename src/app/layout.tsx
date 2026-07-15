import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mission Form Management System",
  description: "Professional CRUD web application for managing missions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body className="min-h-full bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
