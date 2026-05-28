import type { Metadata } from "next";
import { Playfair_Display, Hanken_Grotesk, JetBrains_Mono, Epilogue } from "next/font/google";
import "./globals.css";

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const hankenGrotesk = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["500"],
});

const epilogue = Epilogue({
  variable: "--font-epilogue",
  subsets: ["latin"],
  weight: ["300"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Jugarr | India’s Student Hustle Network",
  description: "Buy, sell, collaborate and earn inside your campus ecosystem. Connecting the dots of campus potential across India.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} ${epilogue.variable} light`}
    >
      <body>{children}</body>
    </html>
  );
}
