"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  UserCheck, 
  RefreshCw, 
  LogOut, 
  ShieldAlert, 
  LogIn
} from "lucide-react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();

  // Danh sách các trang test của bạn
  // LƯU Ý: Sửa lại 'href' cho đúng với đường dẫn file trong dự án Next.js của bạn
  const navItems = [
    {
        name: "Login OAuth Test",
        href: "/login",
        icon: <LogIn className="w-4 h-4" />,
    },
    {
      name: "User Session Info",
      href: "/infor", // Ví dụ: app/user-info/page.tsx
      icon: <UserCheck className="w-4 h-4" />,
    },
    {
      name: "Refresh Token Test",
      href: "/refresh", // Ví dụ: app/refresh-token/page.tsx
      icon: <RefreshCw className="w-4 h-4" />,
    },
  ];

  // Hàm xóa session để test lại từ đầu
  const handleLogout = () => {
    if (confirm("Bạn có chắc muốn xóa toàn bộ Token để test lại?")) {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      // Refresh lại trang hoặc chuyển về login
      router.push("/login"); // Hoặc router.refresh()
      window.location.reload(); // Reload để đảm bảo state được reset
    }
  };

  return (
    <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-2 font-bold text-xl text-slate-800 cursor-pointer" onClick={() => router.push("/")}>
          <div className="bg-slate-900 text-white p-1.5 rounded-md">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <span className="hidden md:block">OAuth Debugger</span>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-lg border">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                }`}
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleLogout}
            className="gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Clear Session</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;