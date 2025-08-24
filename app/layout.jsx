import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import NavBar from "./components/NavBar";
import "./utils/fontAwesomeConfig";

export const metadata = {
  title: "SAAR FITNESS",
  description: "Gym membership system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <AuthProvider>
          <NavBar />
          <main className="pt-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
