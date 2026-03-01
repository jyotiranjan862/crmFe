import routes from "../utils/routes";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const adminRoutes = routes.filter((route) => route.module === "admin");

  return (
    <aside className="w-60 bg-emerald-600 min-h-screen flex flex-col shadow-lg">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-16 border-b border-emerald-700/40">
        <span className="text-xl font-bold text-white tracking-wide select-none">
          CRM<span className="text-emerald-200">Admin</span>
        </span>
      </div>
      {/* Navigation */}
      <nav className="flex-1 mt-2">
        <ul className="flex flex-col gap-1 px-1">
          {adminRoutes.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <li key={path}>
                <Link
                  to={path}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold transition
                    ${isActive ? "bg-white text-emerald-700 shadow-none" : "text-white/90 hover:bg-emerald-700/60 hover:text-white"}
                    focus:outline-none focus:ring-2 focus:ring-emerald-300`}
                >
                  {Icon && (
                    <Icon
                      className={`text-xl ${isActive ? "text-emerald-600" : "text-emerald-200 group-hover:text-white"}`}
                    />
                  )}
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto py-3 px-3 border-t border-emerald-700/40 text-xs text-emerald-100/80 text-center select-none">
        &copy; {new Date().getFullYear()} ApexInnovs CRM
      </div>
    </aside>
  );
};

export default Sidebar;
