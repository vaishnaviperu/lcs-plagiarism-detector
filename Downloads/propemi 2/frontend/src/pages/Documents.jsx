import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Loading, Err } from "../components/UI";
const COLS = [
  { key:"document_id", label:"ID" }, { key:"customer_name", label:"Customer" },
  { key:"document_type", label:"Type" },
  { key:"file_path", label:"File", render: v => v
    ? <a href={v} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">View 📂</a>
    : "—"
  },
  { key:"uploaded_on", label:"Uploaded On" },
];
export default function Documents() {
  const { data, loading, error } = useData(api.documents);
  return (
    <div className="page-inner">
      <div className="page-header"><h1 className="page-title">📄 Documents</h1></div>
      <div className="table-card">
        {loading && <Loading />}{error && <Err message={error} />}
        {data && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
