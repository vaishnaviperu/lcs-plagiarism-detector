const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function get(path, params = {}) {
  const url = new URL(BASE + path);
  Object.entries(params).forEach(([k, v]) => v !== undefined && v !== "" && url.searchParams.set(k, v));
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("API " + res.status + ": " + path);
  return res.json();
}

async function post(path, body = {}) {
  const res = await fetch(BASE + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("API " + res.status + ": " + path);
  return res.json();
}

export const api = {
  // Auth
  login:            (body)   => post("/auth/login", body),

  // Dashboard
  summary:          ()       => get("/dashboard/summary"),
  analytics:        ()       => get("/dashboard/analytics"),
  activity:         ()       => get("/dashboard/activity"),
  notifications:    ()       => get("/dashboard/notifications"),
  kpis:             ()       => get("/dashboard/kpis"),

  // Search
  globalSearch:     (q)      => get("/search", { q }),

  // Customers
  customers:        (search) => get("/customers",       { search }),
  customerProfile:  (id)     => get("/customers/" + id + "/profile"),

  // Agents
  agents:           (search) => get("/agents",          { search }),
  agentPerformance: ()       => get("/agents/performance"),

  // Projects
  projects:         (search) => get("/projects",        { search }),

  // Properties
  properties:       (p)      => get("/properties",      p),

  // Bookings
  bookings:         (p)      => get("/bookings",        p),
  bookingDetail:    (id)     => get("/bookings/" + id),
  cancelBooking:    (id)     => post("/bookings/" + id + "/cancel"),

  // Loans
  loans:            ()       => get("/loans"),

  // EMIs
  emis:             (status) => get("/emis",            { status }),
  markEmiPaid:      (id)     => post("/emis/" + id + "/pay"),

  // Payments
  payments:         ()       => get("/payments"),

  // Cancellations
  cancellations:    ()       => get("/cancellations"),

  // Documents
  documents:        ()       => get("/documents"),

  // Reports
  reportBookings:   ()       => get("/reports/bookings"),
  reportEMI:        ()       => get("/reports/emi"),
  reportProperty:   ()       => get("/reports/property"),
  reportRevenue:    ()       => get("/reports/revenue"),
};