import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RPG Workshop",
  description: "Stitch + Figma-driven workshop for tabletop-RPG site components.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
