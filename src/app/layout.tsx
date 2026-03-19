import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OCBC Smart Search",
  description: "OCBC Credit Card Smart Search Chatbot",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
