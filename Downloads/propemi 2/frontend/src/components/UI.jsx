import { useState } from "react";
import { AlertCircle, Search, Inbox } from "lucide-react";

const BADGE_MAP = {
  ACTIVE:"blue", CONFIRMED:"blue",
  COMPLETED:"green", PAID:"green", AVAILABLE:"green", VERIFIED:"green",
  CANCELLED:"red", REJECTED:"red", SOLD:"red", UNPAID:"red", OVERDUE:"red",
  PENDING:"amber", DUE_SOON:"amber", BOOKED:"amber",
  BOOKING:"purple", EMI:"teal",
};

export function Badge({ value }) {
  if (!value) return <span className="badge badge-gray">—</span>;
  const cls = BADGE_MAP[String(value).toUpperCase()] || "gray";
  return <span className={`badge badge-${cls}`}>{value}</span>;
}

export function Loading() {
  return (
    <div className="loading-wrap">
      <div className="spinner" />
      <span style={{ color: "var(--text3)" }}>Loading data…</span>
    </div>
  );
}

export function Err({ message }) {
  return (
    <div className="error-box">
      <AlertCircle size={16} />
      <span>{message || "Could not load data. Is backend running on port 5000?"}</span>
    </div>
  );
}

export function SearchBar({ onSearch, placeholder = "Search…" }) {
  const [val, setVal] = useState("");
  return (
    <div className="search-input-wrap">
      <div className="search-input-icon"><Search size={14} /></div>
      <input className="search-input" type="text" value={val} placeholder={placeholder}
        onChange={e => { setVal(e.target.value); onSearch(e.target.value); }} />
    </div>
  );
}

export function ProgressBar({ paid, total }) {
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  return (
    <div className="progress-wrap">
      <div className="progress-track"><div className="progress-fill" style={{ width: pct + "%" }} /></div>
      <div className="progress-label">{paid}/{total} paid · {pct}%</div>
    </div>
  );
}

export function Table({ columns, data, rowClass, onRowClick, emptyMsg = "No records found.", emptyIcon }) {
  if (!data || data.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          <Inbox size={26} />
        </div>
        <div className="empty-state-title">{emptyMsg}</div>
        <div className="empty-state-sub">Try adjusting your filters or search term.</div>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>{columns.map(c => <th key={c.key}>{c.label}</th>)}</tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}
              className={rowClass ? rowClass(row) : ""}
              style={onRowClick ? { cursor: "pointer" } : {}}
              onClick={() => onRowClick && onRowClick(row)}>
              {columns.map(c => (
                <td key={c.key}>{c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ConfirmModal({ title, message, onConfirm, onCancel, danger = false }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
        <div className="modal-title">{title}</div>
        <p style={{ fontSize: 13.5, color: "var(--text3)", margin: "8px 0 0" }}>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? "btn-danger" : "btn-success"}`} onClick={onConfirm}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export function exportCSV(data, filename = "export.csv") {
  if (!data?.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => JSON.stringify(r[h] ?? "")).join(","));
  const url = URL.createObjectURL(new Blob([[headers.join(","), ...rows].join("\n")], { type: "text/csv" }));
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export const rupee = v => v != null ? "₹" + Number(v).toLocaleString("en-IN") : "—";