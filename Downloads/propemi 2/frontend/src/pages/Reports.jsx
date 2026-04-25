import { useState } from "react";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Table, Badge, Loading, Err, exportCSV, rupee } from "../components/UI.jsx";

const TABS = [
  { id: "bookings", label: "📋 Booking Report" },
  { id: "emi",      label: "📅 EMI Overview" },
  { id: "property", label: "🏠 Property Availability" },
  { id: "revenue",  label: "💰 Revenue Summary" },
];

const BOOKING_COLS = [
  { key:"booking_id",     label:"ID" },
  { key:"customer_name",  label:"Customer" },
  { key:"property_type",  label:"Type" },
  { key:"project_name",   label:"Project" },
  { key:"agent_name",     label:"Agent" },
  { key:"booking_date",   label:"Date" },
  { key:"booking_amount", label:"Amount", render:rupee },
  { key:"status",         label:"Status", render:v=><Badge value={v}/> },
];

const EMI_COLS = [
  { key:"emi_id",        label:"ID" },
  { key:"customer_name", label:"Customer" },
  { key:"property_type", label:"Property" },
  { key:"due_date",      label:"Due Date" },
  { key:"emi_amount",    label:"Amount",  render:rupee },
  { key:"loan_amount",   label:"Loan",    render:rupee },
  { key:"interest_rate", label:"Rate (%)" },
  { key:"status",        label:"Status",  render:v=><Badge value={v}/> },
];

const PROP_COLS = [
  { key:"property_id",    label:"ID" },
  { key:"project_name",   label:"Project" },
  { key:"property_type",  label:"Type" },
  { key:"price",          label:"Price",    render:rupee },
  { key:"total_bookings", label:"Bookings" },
  { key:"status",         label:"Status",   render:v=><Badge value={v}/> },
];

const REV_COLS = [
  { key:"month",         label:"Month" },
  { key:"transactions",  label:"Transactions" },
  { key:"total_revenue", label:"Revenue",     render:rupee },
  { key:"avg_payment",   label:"Avg Payment", render:v=>rupee(Math.round(v)) },
];

const FETCH = { bookings: "reportBookings", emi: "reportEMI", property: "reportProperty", revenue: "reportRevenue" };
const COLS  = { bookings: BOOKING_COLS, emi: EMI_COLS, property: PROP_COLS, revenue: REV_COLS };
const NAMES = { bookings: "booking_report", emi: "emi_report", property: "property_report", revenue: "revenue_report" };

function ReportTab({ tab }) {
  const { data, loading, error } = useData(api[FETCH[tab]], [tab]);
  return (
    <>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:12, gap:8 }}>
        <button className="export-btn" onClick={() => exportCSV(data, NAMES[tab]+".csv")}>⬇ Export CSV</button>
        <button className="export-btn" onClick={() => window.print()}>🖨 Print</button>
      </div>
      {loading && <Loading />}
      {error   && <Err message={error} />}
      {data    && <div className="table-card"><Table columns={COLS[tab]} data={data} emptyMsg="No data." /></div>}
    </>
  );
}

export default function Reports() {
  const [tab, setTab] = useState("bookings");
  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Reports</h1>
          <p className="page-subtitle">Exportable reports from your database</p>
        </div>
      </div>
      <div className="report-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`report-tab${tab===t.id?" active":""}`} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <ReportTab key={tab} tab={tab} />
    </div>
  );
}