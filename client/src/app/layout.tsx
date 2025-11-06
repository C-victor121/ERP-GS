import '../styles/globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Sidebar from '../components/layout/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Global Solar - ERP',
  description: 'Sistema ERP para operaciones y contabilidad de Global Solar',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex grow">
            <Sidebar />
            <main className="flex-1 px-6 py-8">
              {children}
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}