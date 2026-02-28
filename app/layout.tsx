import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({ variable: "--font-syne", subsets: ["latin"], weight: ["400","600","700"] });
const dmSans = DM_Sans({ variable: "--font-dm-sans", subsets: ["latin"], weight: ["300","400","500","600"] });

export const metadata: Metadata = {
  title: "BergenFlow — Booking for Bergen Fitness",
  description: "Book timer, se timeplan og administrer ditt treningsabonnement hos Bergen Fitness.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="no">
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}
