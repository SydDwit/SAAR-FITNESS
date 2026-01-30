"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/app/components/Icon";
import { useNavBar } from "@/app/components/NavBarContext";

export default function NavBar() {
  const { data: session } = useSession();
  const { collapsed, setCollapsed, isMobile } = useNavBar();
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  // Check if the user is on a protected page
  const isProtectedPage = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");
  
  // Don't show sidebar on public pages
  if (!isProtectedPage) return null;

  // All authenticated users are admins
  const dashboardLink = "/admin";
  const isAdmin = true;

  // Determine if a link is active
  const isActive = (path) => {
    if (path === dashboardLink && pathname === dashboardLink) return true;
    return pathname?.startsWith(path) && path !== dashboardLink;
  };

  // Navigation items for admin
  const navItems = [
    { name: "Dashboard", path: "/admin", icon: "grid" },
    { name: "Members", path: "/admin/members", icon: "users" },
    { name: "Trainers", path: "/admin/staff", icon: "briefcase" },
    { name: "Reports", path: "/admin/reports", icon: "bar-chart-2" },
    { name: "Settings", path: "/admin/settings", icon: "settings" }
  ];
  
  // Mobile sidebar overlay
  const MobileSidebar = () => (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-50 bg-zinc-900 p-2 rounded-md shadow-lg md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Icon name={mobileOpen ? "x" : "menu"} className="w-6 h-6 text-white" />
      </button>
      
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-40" onClick={() => setMobileOpen(false)}>
          <div 
            className="w-64 h-full bg-zinc-900 shadow-lg p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );

  // Desktop sidebar
  const DesktopSidebar = () => (
    <aside 
      className={`fixed top-0 left-0 h-full bg-zinc-900 shadow-xl transition-all duration-300 z-30 border-r border-zinc-800 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-full flex flex-col">
        <SidebarContent />
        
        {/* Collapse Toggle */}
        <div className="mt-auto border-t border-zinc-800 p-4 flex justify-center">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <Icon 
              name={collapsed ? "chevron-right" : "chevron-left"} 
              className="w-5 h-5 text-zinc-500"
            />
          </button>
        </div>
      </div>
    </aside>
  );

  // Common sidebar content
  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className={`flex items-center py-6 ${collapsed ? "justify-center px-2" : "px-6"}`}>
        <Link href="/" className="flex items-center gap-2">
          <img src="/logo.png" className="h-10 w-10 rounded-full" alt="logo" />
          {!collapsed && <span className="font-bold text-xl text-white">SAAR</span>}
        </Link>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.path}
                className={`flex items-center py-3 px-4 rounded-md transition-colors ${
                  collapsed ? "justify-center" : "px-6"
                } ${
                  isActive(item.path) 
                    ? "bg-rose-600/10 text-rose-500" 
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className={`${collapsed ? "w-6 h-6" : "w-5 h-5 mr-3"}`} />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Section */}
      {session && (
        <div className={`mt-auto ${collapsed ? "px-2" : "px-4"}`}>
          <div className={`border-t border-zinc-800 pt-4 mt-4 ${collapsed ? "text-center" : ""}`}>
            {!collapsed && (
              <p className="text-xs text-zinc-500 mb-2">LOGGED IN AS</p>
            )}
            <div className={`flex items-center ${collapsed ? "justify-center" : ""} mb-2`}>
              <div className="bg-rose-600/20 text-rose-500 w-8 h-8 rounded-md flex items-center justify-center font-medium text-sm">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
              </div>
              {!collapsed && (
                <div className="ml-3 overflow-hidden">
                  <p className="text-sm font-medium text-white truncate">
                    {session.user.name || session.user.email.split('@')[0]}
                  </p>
                  <p className="text-xs text-zinc-500 truncate">
                    Administrator
                  </p>
                </div>
              )}
            </div>
            
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className={`mt-2 text-rose-500 hover:text-rose-400 ${
                collapsed 
                  ? "w-full flex justify-center py-2" 
                  : "flex items-center px-3 py-2 w-full rounded-md hover:bg-zinc-800"
              }`}
            >
              <Icon name="log-out" className={`${collapsed ? "w-5 h-5" : "w-4 h-4 mr-2"}`} />
              {!collapsed && <span className="text-sm">Sign Out</span>}
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile Navigation */}
      {isMobile ? <MobileSidebar /> : <DesktopSidebar />}
      
      {/* Content Offset for Desktop */}
      {!isMobile && (
        <div 
          className={`transition-all duration-300 ${
            collapsed ? "ml-20" : "ml-64"
          }`}
        >
          {/* This div provides the offset for the main content */}
        </div>
      )}
    </>
  );
}
