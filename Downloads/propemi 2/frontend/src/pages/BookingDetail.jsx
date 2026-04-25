import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useData } from "../components/useData";
import { Badge, Loading, Err, ProgressBar, rupee } from "../components/UI";

export default function BookingDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { data: b, loading, error, reload } = useData(() => api.bookingDetail(id), [id]);

  async function handleCancel() {
    if (!window.confirm("Cancel this booking?")) return;
    await api.cancelBooking(id);
    reload();
  }

  if (loading) return <div className="page-inner"><Loading /></div>;
  if (error)   return <div className="page-inner"><Err message={error} /></div>;
  if (!b)      return null;

  return (
    <div className="page-inner">
      <button className="back-btn" onClick={() => nav("/bookings")}>← Back to Bookings</button>

      <div className="page-header">
        <div>
          <h1 className="page-title">Booking #{b.booking_id}</h1>
          <p className="page-subtitle">Full booking details with loan, EMI & payment history</p>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <Badge value={b.status} />
          {b.status !== "CANCELLED" && (
            <button className="btn btn-danger" onClick={handleCancel}>✕ Cancel Booking</button>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Customer */}
        <div className="detail-card">
          <div className="detail-card-title">👤 Customer</div>
          {[["Name", b.customer_name], ["Email", b.email], ["Phone", b.phone], ["Address", b.address]].map(([k,v]) => (
            <div className="detail-row" key={k}>
              <span className="detail-key">{k}</span>
              <span className="detail-val">{v || "—"}</span>
            </div>
          ))}
        </div>

        {/* Property */}
        <div className="detail-card">
          <div className="detail-card-title">🏠 Property</div>
          {[["Type", b.property_type], ["Price", rupee(b.price)], ["Status", b.property_status],
            ["Project", b.project_name], ["Location", b.location], ["Developer", b.developer_name]].map(([k,v]) => (
            <div className="detail-row" key={k}>
              <span className="detail-key">{k}</span>
              <span className="detail-val">{v || "—"}</span>
            </div>
          ))}
        </div>

        {/* Agent */}
        <div className="detail-card">
          <div className="detail-card-title">🤝 Agent</div>
          {[["Name", b.agent_name], ["Phone", b.agent_phone], ["Commission", b.commission_rate ? `${b.commission_rate}%` : "—"]].map(([k,v]) => (
            <div className="detail-row" key={k}>
              <span className="detail-key">{k}</span>
              <span className="detail-val">{v || "—"}</span>
            </div>
          ))}
        </div>

        {/* Booking */}
        <div className="detail-card">
          <div className="detail-card-title">📋 Booking Info</div>
          {[["Booking ID", b.booking_id], ["Date", b.booking_date], ["Amount", rupee(b.booking_amount)]].map(([k,v]) => (
            <div className="detail-row" key={k}>
              <span className="detail-key">{k}</span>
              <span className="detail-val">{v || "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Loans */}
      {b.loans?.length > 0 && (
        <div className="detail-card" style={{ marginBottom: 20 }}>
          <div className="detail-card-title">💰 Loan Details</div>
          {b.loans.map(l => (
            <div key={l.loan_id} style={{ marginBottom: 16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ color:"var(--text2)", fontSize:13 }}>Loan #{l.loan_id} — {rupee(l.loan_amount)} at {l.interest_rate}% for {l.tenure_months} months</span>
              </div>
              <ProgressBar paid={l.paid_emis || 0} total={l.total_emis || 0} />
            </div>
          ))}
        </div>
      )}

      {/* EMI Schedule */}
      {b.emis?.length > 0 && (
        <div className="table-card" style={{ marginBottom: 20 }}>
          <div style={{ padding:"18px 20px 0", fontFamily:"var(--font-display)", fontSize:14, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
            📅 EMI Schedule
          </div>
          <table>
            <thead><tr>
              <th>EMI ID</th><th>Due Date</th><th>Amount</th><th>Status</th>
            </tr></thead>
            <tbody>
              {b.emis.map(e => (
                <tr key={e.emi_id}
                  className={e.status==="PAID" ? "emi-paid" : e.due_date < new Date().toISOString().split("T")[0] ? "emi-overdue" : ""}>
                  <td>{e.emi_id}</td>
                  <td>{e.due_date}</td>
                  <td>{rupee(e.emi_amount)}</td>
                  <td><Badge value={e.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Payments */}
      {b.payments?.length > 0 && (
        <div className="table-card">
          <div style={{ padding:"18px 20px 0", fontFamily:"var(--font-display)", fontSize:14, fontWeight:700, color:"var(--text3)", textTransform:"uppercase", letterSpacing:"0.08em" }}>
            💳 Payment History
          </div>
          <table>
            <thead><tr><th>Payment ID</th><th>Date</th><th>Amount</th><th>Type</th></tr></thead>
            <tbody>
              {b.payments.map(p => (
                <tr key={p.payment_id}>
                  <td>{p.payment_id}</td><td>{p.payment_date}</td>
                  <td>{rupee(p.amount)}</td><td><Badge value={p.payment_type} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
