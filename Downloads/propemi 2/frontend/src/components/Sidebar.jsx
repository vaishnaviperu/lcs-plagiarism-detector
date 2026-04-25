import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LayoutDashboard, Users, UserCheck, Trophy,
  Building2, Home, BookOpen, Banknote,
  CalendarDays, CreditCard, XCircle,
  FileText, BarChart3
} from "lucide-react";

const NAV = [
  { section: "Overview" },
  { to: "/",                   Icon: LayoutDashboard, label: "Dashboard",       roles: ["ADMIN","AGENT","CUSTOMER"] },
  { section: "People" },
  { to: "/customers",          Icon: Users,            label: "Customers",       roles: ["ADMIN","AGENT"] },
  { to: "/agents",             Icon: UserCheck,        label: "Agents",          roles: ["ADMIN"] },
  { to: "/agents/performance", Icon: Trophy,           label: "Performance",     roles: ["ADMIN"] },
  { section: "Inventory" },
  { to: "/projects",           Icon: Building2,        label: "Projects",        roles: ["ADMIN","AGENT","CUSTOMER"] },
  { to: "/properties",         Icon: Home,             label: "Properties",      roles: ["ADMIN","AGENT","CUSTOMER"] },
  { section: "Transactions" },
  { to: "/bookings",           Icon: BookOpen,         label: "Bookings",        roles: ["ADMIN","AGENT","CUSTOMER"] },
  { to: "/loans",              Icon: Banknote,         label: "Loans",           roles: ["ADMIN","AGENT"] },
  { to: "/emis",               Icon: CalendarDays,     label: "EMI Schedule",    roles: ["ADMIN","AGENT","CUSTOMER"] },
  { to: "/payments",           Icon: CreditCard,       label: "Payments",        roles: ["ADMIN","AGENT"] },
  { section: "Records" },
  { to: "/cancellations",      Icon: XCircle,          label: "Cancellations",   roles: ["ADMIN"] },
  { to: "/documents",          Icon: FileText,         label: "Documents",       roles: ["ADMIN","AGENT"] },
  { to: "/reports",            Icon: BarChart3,        label: "Reports",         roles: ["ADMIN"] },
];

export function Sidebar() {
  const { user } = useAuth();
  const role = user?.role || "CUSTOMER";

  const visible = NAV.filter(item => item.section || item.roles?.includes(role));
  const filtered = visible.filter((item, i) => {
    if (!item.section) return true;
    const next = visible[i + 1];
    return next && !next.section;
  });

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Building2 size={18} color="white" />
        </div>
        <div>
          <div className="sidebar-logo-name">PropEMI</div>
          <div className="sidebar-logo-tag">Real Estate Portal</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {filtered.map((item, i) =>
          item.section ? (
            <div key={i} className="sidebar-section-title">{item.section}</div>
          ) : (
            <NavLink key={item.to} to={item.to} end={item.to === "/"}
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
              <item.Icon size={15} className="nav-link-icon" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>

      <div className="sidebar-footer">SRM Institute · 2025</div>
    </aside>
  );
}