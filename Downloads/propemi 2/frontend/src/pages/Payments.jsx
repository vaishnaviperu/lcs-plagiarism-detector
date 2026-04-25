import { useState } from "react";
import { Download } from "lucide-react";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Table, Badge, Loading, Err, exportCSV, rupee } from "../components/UI.jsx";

function ReceiptModal({ p, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-title">Payment Receipt</div>
        <div className="modal-sub">Transaction #{p.payment_id}</div>
        {[
          ["Payment ID",  `#${p.payment_id}`],
          ["Customer",    p.customer_name],
          ["Property",    p.property_type],
          ["Booking ID",  `#${p.booking_id}`],
          ["Date",        p.payment_date],
          ["Type",        p.payment_type],
        ].map(([k,v]) => (
          <div className="receipt-row" key={k}>
            <span className="receipt-key">{k}</span>
            <span className="receipt-val">{v || "—"}</span>
          </div>
        ))}
        <div className="receipt-total">
          <span className="receipt-total-label">Amount Paid</span>
          <span className="receipt-total-amount">{rupee(p.amount)}</span>
        </div>
        <div style={{ marginTop: 16, textAlign: "center" }}>
          <button className="export-btn" onClick={() => window.print()}>Print Receipt</button>
        </div>
      </div>
    </div>
  );
}

const COLS = [
  { key: "payment_id",    label: "ID" },
  { key: "customer_name", label: "Customer" },
  { key: "property_type", label: "Property" },
  { key: "booking_id",    label: "Booking" },
  { key: "amount",        label: "Amount",  render: rupee },
  { key: "payment_date",  label: "Date" },
  { key: "payment_type",  label: "Type",    render: v => <Badge value={v} /> },
  { key: "_view", label: "", render: () =>
    <span style={{ fontSize: 12, color: "var(--primary)", fontWeight: 500 }}>View ↗</span>
  },
];

export default function Payments() {
  const { data, loading, error } = useData(api.payments);
  const [selected, setSelected] = useState(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Payments</h1>
          <p className="page-subheading">Click any row to view payment receipt</p>
        </div>
        <button className="export-btn" onClick={() => exportCSV(data, "payments.csv")}>
          <Download size={13} /> Export
        </button>
      </div>
      <div className="table-card">
        {loading && <Loading />}
        {error   && <Err message={error} />}
        {data    && <Table columns={COLS} data={data} onRowClick={setSelected} emptyMsg="No payments found." />}
      </div>
      {selected && <ReceiptModal p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}