import { Instrument_Sans, Mr_Bedfort } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from '@next/third-parties/google';

const sansFont = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-sans",
});

const expressiveScript = Mr_Bedfort({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-expressive-script",
});

export const metadata = {
  metadataBase: new URL("https://tbs.dev"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "'Tubosun // Frontend Developer",
    template: "%s // Olatubosun",
  },
  description:
    "Frontend developer crafting immersive digital experiences through motion, typography, 3D WebGL, and thoughtful engineering.",
  keywords: [
    "Olatubosun",
    "Frontend Developer",
    "WebGL Engineer",
    "Three.js",
    "React",
    "Next.js",
    "Creative Technologist",
    "Motion Design",
  ],
  authors: [{ name: "Olatubosun" }],
  creator: "Olatubosun",
  openGraph: {
    title: "'Tubosun // Frontend Developer",
    description:
      "Frontend developer crafting immersive digital experiences through motion, typography and sleek animations.",
    url: "https://tbs.dev",
    siteName: "'Tubosun Portfolio",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg", // Ensure this image exists in public folder
        width: 1200,
        height: 630,
        alt: "'Tubosun Portfolio Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "'Tubosun // Frontend Developer",
    description:
      "Frontend developer crafting immersive digital experiences through motion, typography and creative coding.",
    creator: "@ola2bosun",
    images: ["/og-image.jpg"], // Ensure this image exists in public folder
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual GSC ID
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sansFont.variable} ${expressiveScript.variable} bg-[#0a0a0a]`}
    >
      <body className="antialiased bg-[#0a0a0a] text-[#f4efe9] selection:bg-[#ecdfcc] selection:text-[#0a0a0a]">
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  );
}
