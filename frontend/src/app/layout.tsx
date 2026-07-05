import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Announcement } from "@/components/layout/announcement-bar";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Providers } from "./providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Sruvalle — Premium Women's Fashion",
    template: "%s | Sruvalle",
  },
  description:
    "Sruvalle is a premium women's fashion label — contemporary and ethnic wear thoughtfully made for the modern woman. Free shipping over ₹1,499.",
  keywords: ["women fashion", "dresses", "kurtis", "sarees", "ethnic wear", "sruvalle"],
  openGraph: {
    title: "Sruvalle — Premium Women's Fashion",
    description: "Effortless fashion, thoughtfully made.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${montserrat.variable}`}>
      <body>
        <Providers>
          <Announcement />
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
