"use client";
import { useNavBar } from "./NavBarContext";

// Hook to get the correct margin class based on navbar state
export function usePageMargin() {
  const { collapsed } = useNavBar();
  return collapsed ? "md:ml-20" : "md:ml-64";
}
