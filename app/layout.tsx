import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Capitán Escala - Auditor Vial',
  description: 'Auditoría de Seguridad Vial en Torrelavega',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased border-8 border-[#141414] h-screen overflow-hidden flex flex-col">{children}</body>
    </html>
  );
}
