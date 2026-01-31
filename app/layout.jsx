import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ClientLayout from "./components/ClientLayout";
import { ThemeProvider } from "./components/ThemeProvider";
import "./utils/fontAwesomeConfig";

export const metadata = {
  title: "SAAR FITNESS",
  description: "Gym membership system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white transition-colors">
        <ThemeProvider>
          <AuthProvider>
            <ClientLayout>{children}</ClientLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
