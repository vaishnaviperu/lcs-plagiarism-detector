import { useState } from "react";
import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Loading, Err, SearchBar } from "../components/UI";
const COLS = [
  { key:"project_id", label:"ID" }, { key:"project_name", label:"Project Name" },
  { key:"location", label:"Location" }, { key:"developer_name", label:"Developer" },
];
export default function Projects() {
  const [search, setSearch] = useState("");
  const { data, loading, error } = useData(() => api.projects(search), [search]);
  return (
    <div className="page-inner">
      <div className="page-header">
        <h1 className="page-title">🏗 Projects</h1>
        <SearchBar onSearch={setSearch} placeholder="Search name or location…" />
      </div>
      <div className="table-card">
        {loading && <Loading />}{error && <Err message={error} />}
        {data && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
