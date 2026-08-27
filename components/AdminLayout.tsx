"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  CreditCard, 
  AlertTriangle, 
  Flag, 
  Tags, 
  BarChart, 
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/verification", label: "Verification Queue", icon: ShieldCheck },
  { href: "/transactions", label: "Transactions", icon: CreditCard },
  { href: "/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/reports", label: "Reviews & Reports", icon: Flag },
  { href: "/categories", label: "Categories & Pricing", icon: Tags },
  { href: "/analytics", label: "Analytics", icon: BarChart },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#F9A826] rounded-full flex items-center justify-center relative overflow-hidden" style={{ borderRadius: "50% 50% 50% 50% / 100% 100% 100% 100%", transform: "scaleX(0.7)" }}>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Oja Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white hover:text-white/80">
          <X className="w-6 h-6" />
        </button>
      </div>
      
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors duration-150 ease-in-out text-sm font-medium",
                isActive 
                  ? "bg-[#028090] text-white" 
                  : "text-sidebar-foreground/80 hover:bg-[#028090]/50 hover:text-white"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-white/10">
        <button className="flex items-center space-x-3 px-3 py-2 w-full rounded-md text-sidebar-foreground/80 hover:bg-white/10 transition-colors text-sm font-medium">
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-background overflow-hidden font-sans">
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#0B3D3E]"
          >
            <div className="relative w-24 h-24 flex items-center justify-center">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute w-16 h-16 rounded-full border border-[#00A896]"
              />
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="absolute w-16 h-16 rounded-full border border-[#F9A826]"
              />
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="absolute w-12 h-16 bg-[#F9A826] rounded-full lens-shape"
                style={{ borderRadius: "50% 50% 50% 50% / 100% 100% 100% 100%", transform: "scaleX(0.6)" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-sidebar p-4 text-sidebar-foreground border-b border-white/10 shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#F9A826] rounded-full flex items-center justify-center relative overflow-hidden" style={{ borderRadius: "50% 50% 50% 50% / 100% 100% 100% 100%", transform: "scaleX(0.7)" }}>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">Oja Admin</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-sidebar text-sidebar-foreground flex-shrink-0 flex-col h-full border-r border-border/10">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.3 }}
              className="fixed inset-y-0 left-0 w-64 bg-sidebar text-sidebar-foreground flex flex-col z-50 shadow-xl md:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative w-full">
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
