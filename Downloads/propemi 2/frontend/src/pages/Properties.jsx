import { useState } from "react";
import { LayoutGrid, List, Download, Home, MapPin } from "lucide-react";
import { api } from "../services/api.js";
import { useData } from "../components/useData.js";
import { Table, Badge, Loading, Err, SearchBar, exportCSV, rupee } from "../components/UI.jsx";

const COLS = [
  { key: "property_id",   label: "ID" },
  { key: "project_name",  label: "Project" },
  { key: "property_type", label: "Type" },
  { key: "price",         label: "Price",  render: rupee },
  { key: "status",        label: "Status", render: v => <Badge value={v} /> },
];

export default function Properties() {
  const [search,   setSearch]   = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [propType, setPropType] = useState("");
  const [view,     setView]     = useState("table");

  const { data, loading, error } = useData(
    () => api.properties({ search, min_price: minPrice, max_price: maxPrice, property_type: propType }),
    [search, minPrice, maxPrice, propType]
  );

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-heading">Properties</h1>
          <p className="page-subheading">{data?.length ?? 0} properties found</p>
        </div>
        <div className="page-actions">
          <div className="view-toggle">
            <button className={`view-toggle-btn${view==="table"?" active":""}`} onClick={() => setView("table")}><List size={15} /></button>
            <button className={`view-toggle-btn${view==="card"?" active":""}`}  onClick={() => setView("card")}><LayoutGrid size={15} /></button>
          </div>
          <button className="export-btn" onClick={() => exportCSV(data, "properties.csv")}>
            <Download size={13} /> Export
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <SearchBar onSearch={setSearch} placeholder="Search type or status…" />
        <input className="filter-input" placeholder="Type (e.g. Apartment)" value={propType} onChange={e => setPropType(e.target.value)} />
        <span className="filter-label">Min ₹</span>
        <input className="filter-input" type="number" placeholder="0" value={minPrice} onChange={e => setMinPrice(e.target.value)} style={{ width: 90 }} />
        <span className="filter-label">Max ₹</span>
        <input className="filter-input" type="number" placeholder="Any" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} style={{ width: 90 }} />
      </div>

      {loading && <Loading />}
      {error   && <Err message={error} />}

      {data && view === "table" && (
        <div className="table-card">
          <Table columns={COLS} data={data} emptyMsg="No properties match your filters." />
        </div>
      )}

      {data && view === "card" && (
        <div className="prop-grid">
          {data.length === 0
            ? <div style={{ gridColumn: "1/-1" }}><div style={{ padding: 40, textAlign: "center", color: "var(--text3)" }}>No properties found</div></div>
            : data.map(p => (
              <div className="prop-card" key={p.property_id}>
                <div className="prop-card-thumb">
                  <Home size={40} style={{ opacity: 0.3 }} />
                </div>
                <div className="prop-card-body">
                  <div className="prop-card-type">{p.property_type || "Property"}</div>
                  <div className="prop-card-project"><MapPin size={11} />{p.project_name}</div>
                  <div className="prop-card-price">{rupee(p.price)}</div>
                  <div className="prop-card-footer">
                    <Badge value={p.status} />
                    <span style={{ fontSize: 11, color: "var(--text4)" }}>#{p.property_id}</span>
                  </div>
                </div>
              </div>
            ))
          }
        </div>
      )}
    </div>
  );
}