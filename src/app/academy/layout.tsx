import { Anton, Inter, Playfair_Display, Sora } from "next/font/google";
import "./academy.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--ga-inter",
  weight: ["400", "500", "600", "700"],
});

const sora = Sora({
  subsets: ["latin"],
  variable: "--ga-sora",
  weight: ["600", "700"],
});

const anton = Anton({
  subsets: ["latin"],
  variable: "--ga-anton",
  weight: "400",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--ga-playfair",
  style: ["italic"],
  weight: ["400"],
});

export const dynamic = "force-dynamic";

export default function AcademyLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`${inter.variable} ${sora.variable} ${anton.variable} ${playfair.variable}`}>
      {children}
    </div>
  );
}
