import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'E4 VTT',
  description: 'Headless VTT MVP foundation',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
