import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Task-It | Gestión de Tareas",
  description: "Aplicación de gestión de tareas laborales - MVP",
};

// Inline script to prevent theme flash
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('task-it-theme');
      if (theme) {
        theme = JSON.parse(theme);
      }
      var resolved = theme;
      if (!theme || theme === 'system') {
        resolved = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.classList.add(resolved);
    } catch (e) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
