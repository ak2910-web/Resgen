import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ResGen — Form Testing & Synthetic Data Generator",
  description:
    "Generate realistic synthetic responses for Google Forms. Built for QA testing, survey logic validation, and mock dataset creation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
