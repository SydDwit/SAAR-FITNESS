"use client";
import { NavBarProvider } from "./NavBarContext";
import NavBar from "./NavBar";
import PublicNavBar from "./PublicNavBar";

export default function ClientLayout({ children }) {
  return (
    <NavBarProvider>
      <NavBar />
      <PublicNavBar />
      <main>{children}</main>
    </NavBarProvider>
  );
}
