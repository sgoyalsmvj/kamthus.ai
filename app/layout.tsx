import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kamthus.ai | AI Calorie Tracker",
  description: "Premium AI-powered nutrition tracking with Gemini 3",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
