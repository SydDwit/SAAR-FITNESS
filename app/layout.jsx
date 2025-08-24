import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "SAAR FITNESS",
  description: "Gym membership system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-black/80 border-b border-zinc-900">
          <div className="container flex items-center gap-6 py-3">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logo.png" className="h-10 w-10 rounded-full" alt="logo" />
              <span className="font-bold text-xl">SAAR FITNESS</span>
            </Link>
            <nav className="ml-auto flex items-center gap-4">
              <Link href="/#home" className="nav-link">Home</Link>
              <Link href="/#about" className="nav-link">About</Link>
              <Link href="/#contact" className="nav-link">Contact</Link>
              <Link href="/login" className="btn py-1 px-4 bg-rose-600">Login</Link>
            </nav>
          </div>
        </header>
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
