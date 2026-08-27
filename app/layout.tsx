import type {Metadata} from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { AdminLayout } from '@/components/AdminLayout';

export const metadata: Metadata = {
  title: 'Oja Admin Portal',
  description: 'Admin Portal for Oja',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased font-sans bg-background text-foreground" suppressHydrationWarning>
        <ThemeProvider defaultTheme="light" storageKey="oja-admin-theme">
          <AdminLayout>
            {children}
          </AdminLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
