import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SPARK.AI — Build once. Prompt everywhere.",
  description: "Define your project once. Use GPT, Claude, and Gemini from one place without re-explaining context.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="felt-bg antialiased">
        {children}
      </body>
    </html>
  );
}
