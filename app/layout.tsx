import '@coinbase/onchainkit/styles.css';
import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Ravdesk Escrow - Secure Multi-Party Contracts',
  description: 'Revolutionary blockchain escrow platform for secure payments',
  openGraph: {
    title: 'Ravdesk Escrow - Secure Multi-Party Contracts',
    description: 'Revolutionary blockchain escrow platform for secure payments',
    images: ['https://raw.githubusercontent.com/Anthonyslav1/Ravdesk_mini/refs/heads/master/Ravdesk.jpg'],
    type: 'website',
  },
  other: {
    // Farcaster Frame meta tags (vNext)
    'fc:frame': 'vNext',
    'fc:frame:image': 'https://raw.githubusercontent.com/Anthonyslav1/Ravdesk_mini/refs/heads/master/Ravdesk.jpg',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:post_url': `${process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || ''}/api/frame`,
    'fc:frame:button:1': '🏦 Create Escrow',
    'fc:frame:button:1:action': 'post',
    'fc:frame:button:2': '📊 My Contracts',
    'fc:frame:button:2:action': 'post',
    // Farcaster Miniapp embed
    'fc:miniapp': JSON.stringify({
      version: '1',
      imageUrl: 'https://raw.githubusercontent.com/Anthonyslav1/Ravdesk_mini/refs/heads/master/Ravdesk.jpg',
      button: {
        title: 'Launch Ravdesk Escrow',
        action: { type: 'launch_miniapp' },
      },
    }),
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-background dark">
        {/* Simple Top Navigation */}
        <header className="border-b border-gray-800/50 bg-black/40 backdrop-blur supports-[backdrop-filter]:bg-black/30">
          <nav className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-4 text-sm">
            <Link href="/" className="text-white font-semibold">Ravdesk</Link>
            <div className="flex items-center gap-4 text-gray-300">
              <Link href="/faqs" className="hover:text-white">FAQs</Link>
              <Link href="/freelancers" className="hover:text-white">Freelancers</Link>
              <Link href="/business" className="hover:text-white">Business</Link>
            </div>
          </nav>
        </header>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
