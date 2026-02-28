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
      <body className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
        <div style={{ background: '#0D0D0D', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', fontSize: '13px', flexWrap: 'wrap' }}>
          <span style={{ background: '#22c55e', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '3px', letterSpacing: '0.1em' }}>DEMO</span>
          <span style={{ color: 'rgba(255,255,255,0.88)', fontWeight: 600 }}>Vil du ha noe lignende for din bedrift?</span>
          <a href="https://sloth-studio.pages.dev" target="_blank" rel="noopener noreferrer" style={{ color: '#60a5fa', fontWeight: 700, textDecoration: 'none' }}>Fa tilbud &rarr;</a>
        </div>
        {children}
      </body>
    </html>
  );
}
