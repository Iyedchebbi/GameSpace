import type { Metadata } from 'next';
import { Providers } from '@/components/Providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GAMEZONE - Level Up Your Game',
  description: 'Your ultimate destination for premium gaming gear. Level up your experience with cutting-edge equipment.',
  icons: {
    icon: [{ url: '/favicon.svg' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      </head>
      <body className="antialiased bg-[#0a0a0a]">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
