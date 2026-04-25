import { useState } from "react";
import { CalendarDays, Download, Printer } from "lucide-react";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Table, Badge, Loading, Err, ConfirmModal, exportCSV, rupee } from "../components/UI.jsx";
import { useToast } from "../context/ToastContext.jsx";

const today = new Date().toISOString().split("T")[0];

function rowClass(row) {
  if (row.emi_status === "PAID") return "emi-paid";
  if (row.due_date < today)      return "emi-overdue";
  const s = new Date(); s.setDate(s.getDate() + 7);
  if (new Date(row.due_date) <= s) return "emi-due-soon";
  return "";
}

function StatusCell({ row }) {
  if (row.emi_status === "PAID") return <Badge value="PAID" />;
  if (row.due_date < today)      return <Badge value="OVERDUE" />;
  const s = new Date(); s.setDate(s.getDate() + 7);
  if (new Date(row.due_date) <= s) return <Badge value="DUE_SOON" />;
  return <Badge value="UNPAID" />;
}

function EMICalendar({ data }) {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDate = {};
  data.forEach(e => { if (e.due_date) byDate[e.due_date.slice(0,10)] = e; });

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthLabel = now.toLocaleString("default", { month: "long", year: "numeric" });

  return (
    <div className="emi-cal-card">
      <div className="emi-cal-header">
        <div className="emi-cal-title">
          <CalendarDays size={15} style={{ marginRight: 6, verticalAlign: "middle" }} />
          EMI Calendar — {monthLabel}
        </div>
        <div className="emi-cal-legend">
          {[
            { cls: "paid",     label: "Paid",     color: "var(--green)" },
            { cls: "unpaid",   label: "Upcoming",  color: "var(--blue)" },
            { cls: "due-soon", label: "Due soon",  color: "var(--amber)" },
            { cls: "overdue",  label: "Overdue",   color: "var(--red)" },
          ].map(l => (
            <div key={l.cls} className="emi-cal-legend-item">
              <div className="legend-dot" style={{ background: l.color }} />
              {l.label}
            </div>
          ))}
        </div>
      </div>

      <div className="cal-weekdays">
        {["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(d =>
          <div key={d} className="cal-weekday">{d}</div>
        )}
      </div>

      <div className="cal-days">
        {cells.map((d, i) => {
          if (!d) return <div key={i} className="cal-cell empty" />;
          const ds = `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
          const emi = byDate[ds];
          let cls = "cal-cell";
          if (emi) {
            if (emi.emi_status === "PAID") cls += " paid";
            else if (ds < today) cls += " overdue";
            else {
              const s = new Date(); s.setDate(s.getDate() + 7);
              cls += new Date(ds) <= s ? " due-soon" : " unpaid";
            }
          }
          if (ds === today) cls += " today";
          return (
            <div key={i} className={cls}
              title={emi ? `${emi.customer_name} — ${rupee(emi.emi_amount)}` : ""}>
              <div className="cal-cell-date">{d}</div>
              {emi && <div className="cal-cell-dot" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function EMIs() {
  const [status,  setStatus]  = useState("");
  const [confirm, setConfirm] = useState(null);
  const { addToast } = useToast();
  const { data, loading, error, reload } = useData(() => api.emis(status), [status]);

  async function handlePay(emiId) {
    await api.markEmiPaid(emiId);
    addToast("EMI marked as paid", "success");
    reload();
    setConfirm(null);
  }

  const COLS = [
    { key: "emi_id",        label: "ID" },
    { key: "customer_name", label: "Customer" },
    { key: "property_type", label: "Property" },
    { key: "loan_id",       label: "Loan" },
    { key: "emi_amount",    label: "Amount",   render: rupee },
    { key: "due_date",      label: "Due Date" },
    { key: "emi_status",    label: "Status",   render: (_, row) => <StatusCell row={row} /> },
    { key: "_pay", label: "", render: (_, row) =>
      row.emi_status !== "PAID"
        ? <button className="btn btn-success btn-sm" onClick={e => { e.stopPropagation(); setConfirm(row); }}>Mark Paid</button>
        : null
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-heading">EMI Schedule</h1>
          <p className="page-subheading">Track EMI payments and due dates</p>
        </div>
        <div className="page-actions">
          <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
            {["","PAID","UNPAID","OVERDUE","DUE_SOON"].map(s =>
              <option key={s} value={s}>{s || "All Statuses"}</option>)}
          </select>
          <button className="export-btn" onClick={() => exportCSV(data,"emis.csv")}>
            <Download size={13} /> Export
          </button>
          <button className="export-btn" onClick={() => window.print()}>
            <Printer size={13} /> Print
          </button>
        </div>
      </div>

      {loading && <Loading />}
      {error   && <Err message={error} />}
      {data    && <EMICalendar data={data} />}
      {data    && (
        <div className="table-card">
          <Table columns={COLS} data={data} rowClass={rowClass} emptyMsg="No EMI records found." />
        </div>
      )}

      {confirm && (
        <ConfirmModal
          title="Mark EMI as Paid"
          message={`Confirm payment of ${rupee(confirm.emi_amount)} for ${confirm.customer_name}?`}
          onConfirm={() => handlePay(confirm.emi_id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}