import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "QR Fiesta",
  description: "Fotos y videos de eventos con QR privado"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
