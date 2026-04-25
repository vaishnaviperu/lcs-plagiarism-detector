import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { api } from "../services/api.js";
import { Search, Bell, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext.jsx";

const PAGE_TITLES = {
  "/": "Dashboard", "/customers": "Customers", "/agents": "Agents",
  "/agents/performance": "Agent Performance", "/projects": "Projects",
  "/properties": "Properties", "/bookings": "Bookings", "/loans": "Loans",
  "/emis": "EMI Schedule", "/payments": "Payments",
  "/cancellations": "Cancellations", "/documents": "Documents", "/reports": "Reports",
};

export default function Topbar() {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const [query,      setQuery]      = useState("");
  const [results,    setResults]    = useState(null);
  const [showNotif,  setShowNotif]  = useState(false);
  const [notifs,     setNotifs]     = useState([]);

  const title = PAGE_TITLES[location.pathname] ||
    (location.pathname.startsWith("/customers/") ? "Customer Profile" :
     location.pathname.startsWith("/bookings/")  ? "Booking Detail" : "");

  useEffect(() => {
    if (query.length < 2) { setResults(null); return; }
    const t = setTimeout(async () => {
      try { setResults(await api.globalSearch(query)); }
      catch {}
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const fn = e => { if (!searchRef.current?.contains(e.target)) setResults(null); };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  async function loadNotifs() {
    try { setNotifs(await api.notifications()); } catch {}
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || "??";

  return (
    <div className="topbar">
      <span className="topbar-title">{title}</span>

      {/* Search */}
      <div className="topbar-search" ref={searchRef}>
        <div className="topbar-search-icon"><Search size={14} /></div>
        <input
          placeholder="Search customers, properties, bookings…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        {results && (
          <div className="search-dropdown">
            {results.customers?.length > 0 && (
              <>
                <div className="search-group-label">Customers</div>
                {results.customers.map(r => (
                  <div key={r.id} className="search-item"
                    onClick={() => { navigate(`/customers/${r.id}`); setQuery(""); setResults(null); }}>
                    <div className="search-item-icon"><Users size={14} /></div>
                    <div>
                      <div className="search-item-name">{r.name}</div>
                      <div className="search-item-meta">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {results.properties?.length > 0 && (
              <>
                <div className="search-group-label">Properties</div>
                {results.properties.map(r => (
                  <div key={r.id} className="search-item"
                    onClick={() => { navigate("/properties"); setQuery(""); setResults(null); }}>
                    <div className="search-item-icon"><Home size={14} /></div>
                    <div>
                      <div className="search-item-name">{r.name}</div>
                      <div className="search-item-meta">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {results.bookings?.length > 0 && (
              <>
                <div className="search-group-label">Bookings</div>
                {results.bookings.map(r => (
                  <div key={r.id} className="search-item"
                    onClick={() => { navigate(`/bookings/${r.id}`); setQuery(""); setResults(null); }}>
                    <div className="search-item-icon"><BookOpen size={14} /></div>
                    <div>
                      <div className="search-item-name">{r.name}</div>
                      <div className="search-item-meta">{r.sub}</div>
                    </div>
                  </div>
                ))}
              </>
            )}
            {!results.customers?.length && !results.properties?.length && !results.bookings?.length && (
              <div className="search-no-results">No results for "{query}"</div>
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <button className="topbar-icon-btn" onClick={toggle} title="Toggle theme">
          {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
        </button>

        {/* Notifications */}
        <div style={{ position: "relative" }}>
          <button className="topbar-icon-btn"
            onClick={() => { setShowNotif(v => !v); loadNotifs(); }}>
            <Bell size={15} />
            {notifs.length > 0 && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="notif-panel">
              <div className="notif-panel-header">
                <span>Notifications</span>
                <span className="notif-badge">{notifs.length}</span>
              </div>
              {notifs.length === 0
                ? <div className="notif-empty">No new notifications</div>
                : notifs.map((n, i) => (
                  <div key={i} className="notif-item">
                    <div className={`notif-item-icon ${n.type === "overdue" ? "red" : "amber"}`}>
                      <Bell size={14} />
                    </div>
                    <div>
                      <div className="notif-item-title">{n.type === "overdue" ? "Overdue EMI" : "Cancelled Booking"}</div>
                      <div className="notif-item-desc">{n.message}</div>
                    </div>
                  </div>
                ))
              }
            </div>
          )}
        </div>

        {/* User */}
        <div className="user-badge" onClick={() => { logout(); addToast("Logged out", "info"); }}>
          <div className="user-avatar">{initials}</div>
          <div>
            <div className="user-badge-name">{user?.username}</div>
            <div className="user-badge-role">{user?.role}</div>
          </div>
          <LogOut size={13} style={{ color: "var(--text3)", marginLeft: 4 }} />
        </div>
      </div>
    </div>
  );
}

// need these imports in Topbar — add at top:
import { Users, Home, BookOpen } from "lucide-react";