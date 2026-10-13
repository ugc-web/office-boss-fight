import { Pixelify_Sans, Silkscreen } from 'next/font/google';
import './globals.css';

const pixel = Pixelify_Sans({ weight: ['400', '500', '700'], subsets: ['latin'], variable: '--font-pixel' });
const title = Silkscreen({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-title' });

const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://office-boss-fight.vercel.app';

export const metadata = {
  metadataBase: new URL(url),
  title: 'Office Boss Fight: Use AI to Survive the Workday',
  description: 'A fun, blocky game that teaches anyone how to use AI at work. No tech skills needed.',
  openGraph: {
    title: 'Office Boss Fight',
    description: 'Beat the Inbox Hydra, Excel Slime & Deadline Dragon with AI. A fun AI game for everyone. No tech skills needed.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Office Boss Fight', description: 'Become the AI Overlord.' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#1b1b1b', viewportFit: 'cover' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pixel.variable} ${title.variable}`}>
      <body className="font-pixel text-lg min-h-[100dvh]">{children}</body>
    </html>
  );
}
