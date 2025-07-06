
import './globals.css';
import { Inter } from 'next/font/google';

import { Toaster as SonnerToaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Personal Finance Visualizer',
  description: 'Track and visualize your personal finances.',
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}

        <SonnerToaster />
      </body>
    </html>
  );
}