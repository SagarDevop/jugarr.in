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
  metadataBase: new URL("https://jugarr.in"),
  title: {
    default: "Jugarr | India’s Student Hustle Network",
    template: "%s | Jugarr",
  },
  description: "Buy, sell, collaborate and earn inside your campus ecosystem. Connecting the dots of student potential across India.",
  keywords: [
    "Jugarr",
    "student network",
    "campus market",
    "student economy",
    "campus hustle",
    "student services",
    "circular economy",
    "buy and sell on campus",
    "college marketplace",
    "student gigs",
    "India college marketplace",
    "broke genius economy",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Jugarr | India’s Student Hustle Network",
    description: "Buy, sell, collaborate and earn inside your campus ecosystem. Connecting the dots of student potential across India.",
    url: "https://jugarr.in",
    siteName: "Jugarr",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Jugarr - India's Student Hustle Network",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jugarr | India’s Student Hustle Network",
    description: "Buy, sell, collaborate and earn inside your campus ecosystem. Connecting the dots of student potential across India.",
    images: ["/twitter-image.png"],
    creator: "@Jugaaddotco",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://jugarr.in/#website",
        "url": "https://jugarr.in",
        "name": "Jugarr",
        "description": "India’s Student Hustle Network - Buy, sell, collaborate and earn inside your campus ecosystem.",
        "publisher": {
          "@id": "https://jugarr.in/#organization"
        }
      },
      {
        "@type": "Organization",
        "@id": "https://jugarr.in/#organization",
        "name": "Jugarr",
        "url": "https://jugarr.in",
        "logo": "https://jugarr.in/assets/logo.png",
        "sameAs": [
          "https://www.instagram.com/jugarr.in",
          "https://www.linkedin.com/company/jugaaddotco/posts/?feedView=all",
          "https://www.threads.com/@jugarr.in",
          "https://x.com/Jugaaddotco"
        ]
      }
    ]
  };

  return (
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${hankenGrotesk.variable} ${jetbrainsMono.variable} ${epilogue.variable} light`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
