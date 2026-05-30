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
    default: "Jugarr \u2013 Student Marketplace | Buy, Sell & Earn on Campus",
    template: "%s | Jugarr",
  },
  description: "India\u2019s student-to-student campus marketplace. Buy and sell old books, notes, furniture, and gadgets. Find opportunities and earn within your college.",
  keywords: [
    "Jugarr",
    "student marketplace",
    "campus marketplace",
    "college marketplace",
    "student-to-student marketplace",
    "buy and sell books college",
    "sell old books",
    "second-hand furniture college",
    "student opportunities",
    "student economy",
    "campus market",
    "student services",
    "buy and sell on campus",
    "college marketplace India",
    "student gigs",
    "student network",
    "circular economy",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Jugarr \u2013 India\u2019s Student-to-Student Campus Marketplace",
    description: "Buy and sell books, notes, furniture, and gadgets. Find internships, offer services, and earn \u2014 all within your college campus ecosystem.",
    url: "https://jugarr.in",
    siteName: "Jugarr",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Jugarr \u2013 India\u2019s Student-to-Student Campus Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jugarr \u2013 Student Campus Marketplace",
    description: "India\u2019s student-to-student marketplace. Buy, sell, earn, and collaborate within your college campus.",
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
        "description": "India\u2019s student-to-student campus marketplace. Buy and sell books, notes, furniture, gadgets. Find internships and earn within your college.",
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
      },
      {
        "@type": "FAQPage",
        "@id": "https://jugarr.in/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What is Jugarr?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Jugarr is India\u2019s student-to-student campus marketplace where college students can buy, sell, trade, and earn within their own university community. Think of it as a trusted, campus-only marketplace built exclusively for students."
            }
          },
          {
            "@type": "Question",
            "name": "How does Jugarr work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Students sign up with their college email, browse or list items and services, and connect directly with other verified students on campus. No middlemen, no shipping \u2014 just meet up on campus and exchange."
            }
          },
          {
            "@type": "Question",
            "name": "How can students sell old books on Jugarr?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Simply create a listing for your old textbooks with photos and a price. Students in your college searching for those books will find your listing and reach out directly."
            }
          },
          {
            "@type": "Question",
            "name": "Can students buy second-hand furniture on Jugarr?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes. Graduating students frequently list desks, chairs, mattresses, and shelves at affordable prices. Buyers can inspect items on campus before purchasing."
            }
          },
          {
            "@type": "Question",
            "name": "Is Jugarr free to use?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, Jugarr is completely free. There are no listing fees, no commissions, and no hidden charges. Every transaction is direct and between students."
            }
          },
          {
            "@type": "Question",
            "name": "Which colleges can join Jugarr?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Jugarr is currently launching across select Indian colleges. Join the waitlist with your college email, and we will notify you when your campus goes live."
            }
          },
          {
            "@type": "Question",
            "name": "How does the Jugarr waitlist work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Enter your name and college email on the waitlist form. Once enough students from your campus sign up, we activate Jugarr for your college. Early members get priority access and founding member benefits."
            }
          }
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
