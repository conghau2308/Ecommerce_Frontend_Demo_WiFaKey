import Header from "@/components/layouts/header";
import { Badge } from "@/components/ui/badge";
import { Bug } from "lucide-react";

export default function Home() {
  return (
    <main>
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center space-y-6 py-12 md:py-16">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-amber-500 text-amber-700 bg-amber-50 rounded-full shadow-sm"
          >
            <Bug className="w-3.5 h-3.5 mr-2" />
            DEBUG / DEVELOPMENT ENVIRONMENT
          </Badge>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl drop-shadow-sm">
            WiFaKey Auth Debugger
          </h1>

          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Công cụ kiểm tra luồng xác thực (Authentication Flow), giải mã Token
            và kiểm thử tính năng Refresh Token Rotation giữa Client và Server.
          </p>
        </div>
      </div>
    </main>
  );
}
