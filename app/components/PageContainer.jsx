"use client";
import { useNavBar } from "./NavBarContext";

export default function PageContainer({ children, className = "" }) {
  const { collapsed } = useNavBar();
  
  return (
    <div className={`${collapsed ? "md:ml-20" : "md:ml-64"} transition-all duration-300 ${className}`}>
      {children}
    </div>
  );
}
