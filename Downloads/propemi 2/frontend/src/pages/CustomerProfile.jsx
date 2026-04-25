import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Badge, Loading, Err, rupee } from "../components/UI.jsx";

export default function CustomerProfile() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: c, loading, error } = useData(() => api.customerProfile(id), [id]);

  if (loading) return <div className="page-inner"><Loading /></div>;
  if (error)   return <div className="page-inner"><Err message={error} /></div>;
  if (!c)      return null;

  return (
    <div className="page-inner">
      <button className="back-btn" onClick={() => nav("/customers")}>← Back to Customers</button>
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 {c.customer_name}</h1>
          <p className="page-subtitle">{c.email} · {c.phone}</p>
        </div>
      </div>

      <div className="detail-grid">
        <div className="detail-card">
          <div className="detail-card-title">👤 Personal Info</div>
          {[["Customer ID", c.customer_id],["Email", c.email],["Phone", c.phone],["Address", c.address]].map(([k,v]) => (
            <div className="detail-row" key={k}><span className="detail-key">{k}</span><span className="detail-val">{v||"—"}</span></div>
          ))}
        </div>
        <div className="detail-card">
          <div className="detail-card-title">📊 Summary</div>
          {[
            ["Total Bookings", c.bookings?.length || 0],
            ["Total Payments", c.payments?.length || 0],
            ["Total EMIs", c.emis?.length || 0],
            ["Documents", c.documents?.length || 0],
          ].map(([k,v]) => (
            <div className="detail-row" key={k}><span className="detail-key">{k}</span><span className="detail-val">{v}</span></div>
          ))}
        </div>
      </div>

      {/* Bookings */}
      {c.bookings?.length > 0 && (
        <div className="table-card" style={{ marginBottom:18 }}>
          <div style={{ padding:"16px 18px 0", color:"var(--text3)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>📋 Bookings</div>
          <table>
            <thead><tr><th>ID</th><th>Property</th><th>Project</th><th>Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{c.bookings.map(b => (
              <tr key={b.booking_id}>
                <td>#{b.booking_id}</td><td>{b.property_type}</td><td>{b.project_name}</td>
                <td>{b.booking_date}</td><td>{rupee(b.booking_amount)}</td><td><Badge value={b.status}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* EMIs */}
      {c.emis?.length > 0 && (
        <div className="table-card" style={{ marginBottom:18 }}>
          <div style={{ padding:"16px 18px 0", color:"var(--text3)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>📅 EMI History</div>
          <table>
            <thead><tr><th>ID</th><th>Due Date</th><th>Amount</th><th>Status</th></tr></thead>
            <tbody>{c.emis.map(e => (
              <tr key={e.emi_id}>
                <td>#{e.emi_id}</td><td>{e.due_date}</td><td>{rupee(e.emi_amount)}</td><td><Badge value={e.status}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {c.payments?.length > 0 && (
        <div className="table-card">
          <div style={{ padding:"16px 18px 0", color:"var(--text3)", fontSize:12, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>💳 Payments</div>
          <table>
            <thead><tr><th>ID</th><th>Date</th><th>Amount</th><th>Type</th></tr></thead>
            <tbody>{c.payments.map(p => (
              <tr key={p.payment_id}>
                <td>#{p.payment_id}</td><td>{p.payment_date}</td><td>{rupee(p.amount)}</td><td><Badge value={p.payment_type}/></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}