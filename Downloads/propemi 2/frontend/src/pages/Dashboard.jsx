import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Loading, Err, rupee } from "../components/UI.jsx";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import {
  IndianRupee, CalendarDays, XCircle, Home,
  Users, Building2, BookOpen, Banknote, CreditCard, UserCheck, FolderKanban,
  BookMarked, TrendingUp, AlertTriangle
} from "lucide-react";

const PIE_COLORS = { AVAILABLE: "#059669", BOOKED: "#D97706", SOLD: "#DC2626" };
const TT_STYLE = {
  contentStyle: {
    background: "var(--surface)", border: "1px solid var(--border2)",
    borderRadius: 8, fontSize: 12, fontFamily: "Inter, sans-serif",
    boxShadow: "var(--shadow)"
  }
};

const ACTIVITY_ICONS = {
  booking: { Icon: BookOpen,   cls: "booking" },
  payment: { Icon: CreditCard, cls: "payment" },
  cancel:  { Icon: XCircle,    cls: "cancel"  },
};

export default function Dashboard() {
  const { data: summary,  loading: l1 } = useData(api.summary);
  const { data: analytics,loading: l2 } = useData(api.analytics);
  const { data: activity, loading: l3 } = useData(api.activity);
  const { data: kpis,     loading: l4 } = useData(api.kpis);

  const isLoading = l1 || l2 || l3 || l4;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Dashboard</h1>
          <p className="page-subheading">Overview of your real estate portfolio and finances</p>
        </div>
      </div>

      {isLoading && <Loading />}

      {/* KPI Cards */}
      {kpis && (
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {[
            { label: "Total Revenue",          value: rupee(kpis.total_revenue),  Icon: IndianRupee, color: "blue",  change: kpis.revenue_change },
            { label: "Pending EMI Amount",     value: rupee(kpis.pending_emi),    Icon: CalendarDays, color: "amber" },
            { label: "Cancelled Bookings",     value: kpis.cancelled,             Icon: XCircle,     color: "red" },
            { label: "Available Properties",   value: kpis.available,             Icon: Home,        color: "green" },
          ].map(card => (
            <div className="kpi-card" key={card.label}>
              <div className="kpi-card-top">
                <div className={`kpi-icon ${card.color}`}>
                  <card.Icon size={18} />
                </div>
                {card.change !== undefined && (
                  <span className={`kpi-change ${card.change > 0 ? "up" : card.change < 0 ? "down" : "flat"}`}>
                    {card.change > 0 ? "+" : ""}{card.change}%
                  </span>
                )}
              </div>
              <div className="kpi-value">{card.value}</div>
              <div className="kpi-label">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Entity Stats */}
      {summary && (
        <div className="stats-grid">
          {[
            { key: "total_customers",  label: "Customers",  Icon: Users },
            { key: "total_properties", label: "Properties", Icon: Home },
            { key: "total_bookings",   label: "Bookings",   Icon: BookOpen },
            { key: "total_loans",      label: "Loans",      Icon: Banknote },
            { key: "total_payments",   label: "Payments",   Icon: CreditCard },
            { key: "total_agents",     label: "Agents",     Icon: UserCheck },
            { key: "total_projects",   label: "Projects",   Icon: Building2 },
          ].map(c => (
            <div className="stat-card" key={c.key}>
              <div className="stat-card-icon"><c.Icon size={16} /></div>
              <div className="stat-value">{summary[c.key] ?? 0}</div>
              <div className="stat-label">{c.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Insights */}
      {analytics && (
        <div className="insights-grid">
          {[
            { label: "Top Agent",          value: analytics.top_agent?.agent_name || "—",          Icon: UserCheck,     color: "gold" },
            { label: "Popular Type",       value: analytics.popular_type?.property_type || "—",    Icon: Home,          color: "blue" },
            { label: "Revenue This Month", value: rupee(analytics.revenue_this_month),             Icon: TrendingUp,    color: "green" },
            { label: "Overdue EMIs",       value: analytics.overdue_emis,                          Icon: AlertTriangle, color: "red" },
          ].map(ins => (
            <div className="insight-card" key={ins.label}>
              <div className={`insight-icon ${ins.color}`}><ins.Icon size={17} /></div>
              <div>
                <div className="insight-label">{ins.label}</div>
                <div className="insight-value"
                  style={ins.color === "red" && analytics.overdue_emis > 0 ? { color: "var(--red)" } : {}}>
                  {ins.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      {analytics && (
        <div className="charts-grid">
          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">Revenue Trend</div>
              <div className="chart-card-sub">Monthly payment collections</div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={analytics.revenue_trend}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip {...TT_STYLE} formatter={v => rupee(v)} />
                <Line type="monotone" dataKey="total_revenue" stroke="var(--primary)" strokeWidth={2} dot={false} name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">Bookings per Month</div>
              <div className="chart-card-sub">Total bookings created monthly</div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={analytics.bookings_trend} barSize={18}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "var(--text3)" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip {...TT_STYLE} />
                <Bar dataKey="total_bookings" fill="var(--primary)" radius={[4,4,0,0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <div className="chart-card-header">
              <div className="chart-card-title">Property Status</div>
              <div className="chart-card-sub">Availability breakdown</div>
            </div>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={analytics.property_status} dataKey="count" nameKey="status"
                  cx="50%" cy="45%" outerRadius={68} innerRadius={36} paddingAngle={3}>
                  {analytics.property_status.map((e, i) => (
                    <Cell key={i} fill={PIE_COLORS[e.status] || "#6B7280"} />
                  ))}
                </Pie>
                <Tooltip {...TT_STYLE} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {activity && activity.length > 0 && (
        <div className="activity-card">
          <div className="activity-card-header">
            <span className="activity-card-title">Recent Activity</span>
          </div>
          <div className="activity-list">
            {activity.map((a, i) => {
              const { Icon, cls } = ACTIVITY_ICONS[a.type] || ACTIVITY_ICONS.booking;
              return (
                <div className="activity-item" key={i}>
                  <div className={`activity-icon ${cls}`}>
                    <Icon size={14} />
                  </div>
                  <div className="activity-content">
                    <div className="activity-title">{a.text}</div>
                    <div className="activity-date">{a.date || "—"}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}