import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Business Operator AI — Pickard's PEI Fire Pit Desk",
  description: "Autonomous business operator AI for local PEI fire pit sales",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
