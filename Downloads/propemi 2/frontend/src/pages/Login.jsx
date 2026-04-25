import { useState } from "react";
import { Building2, Lock, User } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useToast } from "../context/ToastContext.jsx";

const BASE = "http://localhost:5000/api";

export default function Login() {
  const { login }  = useAuth();
  const { addToast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      login(data);
      addToast(`Welcome back, ${data.username}`, "success");
    } catch {
      setError("Cannot reach server. Is backend running on port 5000?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Left panel */}
      <div style={{
        flex: 1,
        background: "#0F172A",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* subtle grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 420 }}>
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 56 }}>
            <div style={{
              width: 40, height: 40,
              background: "#2563EB",
              borderRadius: 10,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Building2 size={20} color="white" />
            </div>
            <span style={{ color: "white", fontWeight: 700, fontSize: 18, letterSpacing: "-0.3px" }}>
              PropEMI
            </span>
          </div>

          <h1 style={{
            fontSize: 36,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.8px",
            lineHeight: 1.15,
            marginBottom: 16,
          }}>
            Real Estate<br />Finance Portal
          </h1>

          <p style={{ fontSize: 15, color: "#94A3B8", lineHeight: 1.7, marginBottom: 48 }}>
            Manage properties, bookings, loans and EMI schedules in one unified dashboard.
          </p>

          {/* Feature list */}
          {[
            "End-to-end booking management",
            "Automated EMI scheduling",
            "Revenue analytics & reports",
          ].map(f => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 20, height: 20,
                background: "rgba(37,99,235,0.2)",
                borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <div style={{ width: 6, height: 6, background: "#60A5FA", borderRadius: "50%" }} />
              </div>
              <span style={{ fontSize: 13.5, color: "#CBD5E1" }}>{f}</span>
            </div>
          ))}
        </div>

        {/* bottom tag */}
        <div style={{ position: "absolute", bottom: 28, left: 56, fontSize: 12, color: "#475569" }}>
          DBMS Mini Project · SRM Institute 2025
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        width: 480,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F6F8FB",
        padding: "40px 48px",
      }}>
        <div style={{ width: "100%" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", letterSpacing: "-0.4px", marginBottom: 6 }}>
            Sign in
          </h2>
          <p style={{ fontSize: 13.5, color: "#6B7280", marginBottom: 32 }}>
            Enter your credentials to access the dashboard
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7,
              }}>Username</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex" }}>
                  <User size={15} />
                </div>
                <input
                  style={{
                    width: "100%", background: "white",
                    border: "1px solid #E5E7EB", borderRadius: 8,
                    color: "#111827", padding: "11px 14px 11px 36px",
                    fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none",
                  }}
                  placeholder="Enter username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: "block", fontSize: 12, fontWeight: 600,
                color: "#374151", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 7,
              }}>Password</label>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", display: "flex" }}>
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  style={{
                    width: "100%", background: "white",
                    border: "1px solid #E5E7EB", borderRadius: 8,
                    color: "#111827", padding: "11px 14px 11px 36px",
                    fontSize: 14, fontFamily: "'Inter',sans-serif", outline: "none",
                  }}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div style={{
                background: "#FEF2F2", border: "1px solid #FECACA",
                borderRadius: 8, padding: "10px 14px",
                color: "#DC2626", fontSize: 13, marginBottom: 16,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "12px",
                background: loading ? "#93C5FD" : "#2563EB",
                color: "white", border: "none", borderRadius: 8,
                fontSize: 14.5, fontWeight: 600, fontFamily: "'Inter',sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "background 0.18s",
                letterSpacing: "-0.1px",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div style={{
            marginTop: 28, padding: "14px 16px",
            background: "white", border: "1px solid #E5E7EB",
            borderRadius: 8, fontSize: 12, color: "#6B7280",
          }}>
            <div style={{ fontWeight: 600, color: "#374151", marginBottom: 6 }}>Demo credentials</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span><code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: 4, fontSize: 11.5 }}>admin</code> / <code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: 4, fontSize: 11.5 }}>admin123</code> — Admin</span>
              <span><code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: 4, fontSize: 11.5 }}>cust01</code> / <code style={{ background: "#F3F4F6", padding: "1px 6px", borderRadius: 4, fontSize: 11.5 }}>pass01</code> — Customer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}