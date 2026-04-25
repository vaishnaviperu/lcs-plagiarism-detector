import { useState } from "react";
import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Loading, Err, SearchBar } from "../components/UI";
const COLS = [
  { key:"agent_id", label:"ID" }, { key:"agent_name", label:"Name" },
  { key:"phone", label:"Phone" }, { key:"commission_rate", label:"Commission Rate" },
];
export default function Agents() {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useData(() => api.agents(search), [search]);
  return (
    <div className="page-inner">
      <div className="page-header">
        <h1 className="page-title">🤝 Agents</h1>
        <SearchBar onSearch={setSearch} placeholder="Search name or phone…" />
      </div>
      <div className="table-card">
        {loading && <Loading />}{error && <Err message={error} />}
        {data && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
