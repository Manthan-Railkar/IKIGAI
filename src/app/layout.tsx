import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "History Virtual Museum",
  description:
    "Explore mankind history explained through virtual museum exhibitions, expositions, media, and audio guides about Ancient Greece and classical history.",
  openGraph: {
    title: "History Virtual Museum",
    images: ["/Assets/opengraph.jpg"],
  },
  twitter: {
    title: "History Virtual Museum",
    images: ["/Assets/opengraph.jpg"],
  },
  icons: {
    icon: "/Assets/favicon.jpg",
    apple: "/Assets/webclip.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
