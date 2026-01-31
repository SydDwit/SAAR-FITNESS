"use client";
import { NavBarProvider } from "./NavBarContext";
import NavBar from "./NavBar";
import PublicNavBar from "./PublicNavBar";
import { usePathname } from "next/navigation";

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login" || pathname === "/login";

  return (
    <NavBarProvider>
      {!isLoginPage && (
        <>
          <NavBar />
          <PublicNavBar />
        </>
      )}
      <main>{children}</main>
    </NavBarProvider>
  );
}
