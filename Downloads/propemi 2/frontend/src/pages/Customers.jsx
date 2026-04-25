import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Table, Loading, Err, SearchBar, exportCSV } from "../components/UI.jsx";

const COLS = [
  { key:"customer_id",   label:"ID" },
  { key:"customer_name", label:"Name" },
  { key:"email",         label:"Email" },
  { key:"phone",         label:"Phone" },
  { key:"address",       label:"Address" },
  { key:"_view",         label:"", render:()=><span style={{fontSize:11,color:"var(--blue)",cursor:"pointer"}}>Profile →</span> },
];

export default function Customers() {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useData(() => api.customers(search), [search]);
  const nav = useNavigate();

  return (
    <div className="page-inner">
      <div className="page-header">
        <div>
          <h1 className="page-title">👤 Customers</h1>
          <p className="page-subtitle">Click a row to view full profile</p>
        </div>
        <div className="page-controls">
          <SearchBar onSearch={setSearch} placeholder="Search name, email, phone…" />
          <button className="export-btn" onClick={() => exportCSV(data,"customers.csv")}>⬇ CSV</button>
        </div>
      </div>
      <div className="table-card">
        {loading && <Loading />}
        {error   && <Err message={error} />}
        {data    && <Table columns={COLS} data={data} onRowClick={row => nav(`/customers/${row.customer_id}`)} emptyMsg="No customers found." emptyIcon="👤" />}
      </div>
    </div>
  );
}