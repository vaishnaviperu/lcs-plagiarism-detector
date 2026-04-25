import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Badge, Loading, Err, SearchBar, rupee } from "../components/UI";

const COLS = [
  { key: "booking_id",     label: "ID" },
  { key: "customer_name",  label: "Customer" },
  { key: "property_type",  label: "Type" },
  { key: "project_name",   label: "Project" },
  { key: "agent_name",     label: "Agent" },
  { key: "booking_date",   label: "Date" },
  { key: "booking_amount", label: "Amount", render: rupee },
  { key: "status",         label: "Status", render: v => <Badge value={v} /> },
  { key: "_actions",       label: "", render: (_, row) => <ViewBtn id={row.booking_id} /> },
];

function ViewBtn({ id }) {
  const nav = useNavigate();
  return <button className="btn btn-ghost btn-sm" onClick={() => nav(`/bookings/${id}`)}>View →</button>;
}

export default function Bookings() {
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [dateFrom,  setDateFrom]  = useState("");
  const [dateTo,    setDateTo]    = useState("");

  const { data, loading, error } = useData(
    () => api.bookings({ search, status, date_from: dateFrom, date_to: dateTo }),
    [search, status, dateFrom, dateTo]
  );

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">📋 Bookings</h1>
          <p className="page-subtitle">Click any row to view full booking details</p>
        </div>
      </div>

      <div className="filter-row" style={{ marginBottom: 20 }}>
        <SearchBar onSearch={setSearch} placeholder="Search customer, agent…" />
        <span className="filter-label">Status</span>
        <select className="filter-select" value={status} onChange={e => setStatus(e.target.value)}>
          {["", "ACTIVE", "CANCELLED", "COMPLETED"].map(s =>
            <option key={s} value={s}>{s || "All"}</option>)}
        </select>
        <span className="filter-label">From</span>
        <input type="date" className="filter-input" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        <span className="filter-label">To</span>
        <input type="date" className="filter-input" value={dateTo} onChange={e => setDateTo(e.target.value)} />
      </div>

      <div className="table-card">
        {loading && <Loading />}
        {error   && <Err message={error} />}
        {data    && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
