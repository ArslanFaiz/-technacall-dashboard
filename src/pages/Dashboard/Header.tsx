import { auth } from "../../utils/auth";
import { useNavigate } from "react-router-dom";
import { LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "../../components";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="w-full bg-gradient-to-r from-black via-gray-900 to-purple-800 text-white shadow-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
      {/* Left Section */}
      <div className="flex items-center gap-2 sm:gap-3">
        <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-90" />
        <Button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="text-base sm:text-lg font-semibold tracking-wide hover:text-gray-300 transition-colors duration-200"
        >
          Dashboard
        </Button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto">
        {/* User Info */}
        <div className="hidden sm:block text-sm text-right leading-tight">
          <div className="text-xs text-gray-300 font-light">Signed in as</div>
          <div className="font-semibold text-white truncate max-w-[120px]">
            Admin
          </div>
        </div>

        {/* Logout Button */}
        <Button
          onClick={handleLogout}
          className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-medium backdrop-blur-sm border border-white/20 transition-all duration-300"
        >
          <LogOut className="w-4 h-4" />
          <span className="sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}
