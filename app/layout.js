import { Press_Start_2P, VT323 } from 'next/font/google';
import './globals.css';

const pixel = Press_Start_2P({ weight: '400', subsets: ['latin'], variable: '--font-pixel' });
const body = VT323({ weight: '400', subsets: ['latin'], variable: '--font-body' });

const url = process.env.NEXT_PUBLIC_SITE_URL || 'https://office-boss-fight.vercel.app';

export const metadata = {
  metadataBase: new URL(url),
  title: 'Office Boss Fight: Use AI to Survive the Workday',
  description: 'Fight office villains using the right AI tools. Survive the workday. Become the AI Overlord.',
  openGraph: {
    title: 'Office Boss Fight',
    description: 'Your Office Has Bosses. Do You Have AI? Five boss fights, 2–4 minutes.',
    type: 'website',
  },
  twitter: { card: 'summary', title: 'Office Boss Fight', description: 'Become the AI Overlord.' },
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f1226' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`}>
      <body className="font-body text-xl min-h-screen">{children}</body>
    </html>
  );
}
