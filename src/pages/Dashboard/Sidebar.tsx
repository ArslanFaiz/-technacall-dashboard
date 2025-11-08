import { NavLink } from "react-router-dom";
import { FileText, CalendarDays, Mail } from "lucide-react";

const items = [
  { to: "/dashboard/blogs", label: "Blogs", icon: FileText },
  { to: "/dashboard/bookings", label: "System Bookings", icon: CalendarDays },
  { to: "/dashboard/contacts", label: "Contacts", icon: Mail },
];

export default function Sidebar() {
  return (
    <>
      {/* 🌟 Desktop / Tablet Sidebar */}
      <aside className="w-64 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white min-h-screen p-6 shadow-xl hidden md:flex flex-col justify-between">
        <div>
          <div className="mb-8">
            <h2 className="text-2xl font-bold tracking-wide">Admin Panel</h2>
            <p className="text-sm text-blue-100">Manage your system</p>
          </div>

          <nav className="flex flex-col space-y-2">
            {items.map((it) => {
              const Icon = it.icon;
              return (
                <NavLink
                  key={it.to}
                  to={it.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                      isActive
                        ? "bg-white text-blue-700 shadow-md"
                        : "text-blue-100 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {it.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/20 pt-4 text-xs text-blue-100">
          <p>© {new Date().getFullYear()} Admin Dashboard</p>
          <p className="opacity-75">All rights reserved.</p>
        </div>
      </aside>

      {/* 📱 Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white flex justify-around items-center py-2 shadow-lg md:hidden z-50">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.to}
              to={it.to}
              className={({ isActive }) =>
                `flex flex-col items-center text-xs transition-all duration-200 ${
                  isActive
                    ? "text-yellow-300"
                    : "text-blue-100 hover:text-white"
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              {it.label.split(" ")[0]}
            </NavLink>
          );
        })}
      </nav>
    </>
  );
}
