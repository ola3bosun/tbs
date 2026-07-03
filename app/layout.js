// app/layout.js
import { Instrument_Sans, Mr_Bedfort } from 'next/font/google';
import './globals.css';

const sansFont = Instrument_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-sans',
});

const expressiveScript = Mr_Bedfort({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-expressive-script',
});

export const metadata = {
  title: 'Tubosun // Portfolio',
  description: 'Frontend Developer Minimalist Digital Workspace',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${sansFont.variable} ${expressiveScript.variable} bg-[#181c14]`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
