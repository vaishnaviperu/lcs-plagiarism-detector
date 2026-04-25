import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Badge, Loading, Err, ProgressBar, rupee } from "../components/UI";

const COLS = [
  { key: "loan_id",        label: "ID" },
  { key: "customer_name",  label: "Customer" },
  { key: "property_type",  label: "Property" },
  { key: "loan_amount",    label: "Loan Amount", render: rupee },
  { key: "interest_rate",  label: "Interest (%)" },
  { key: "tenure_months",  label: "Tenure (mo)" },
  { key: "booking_status", label: "Status", render: v => <Badge value={v} /> },
  { key: "_progress", label: "EMI Progress", render: (_, row) =>
    <ProgressBar paid={Number(row.paid_emis) || 0} total={Number(row.total_emis) || 0} />
  },
];

export default function Loans() {
  const { data, loading, error } = useData(api.loans);
  return (
    <div className="page-inner">
      <div className="page-header">
        <h1 className="page-title">💰 Loans</h1>
      </div>
      <div className="table-card">
        {loading && <Loading />}
        {error   && <Err message={error} />}
        {data    && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
