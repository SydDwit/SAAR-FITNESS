import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import ClientLayout from "./components/ClientLayout";
import "./utils/fontAwesomeConfig";

export const metadata = {
  title: "SAAR FITNESS",
  description: "Gym membership system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-white">
        <AuthProvider>
          <ClientLayout>{children}</ClientLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
