import { api } from "../services/api";
import { useData } from "../components/useData";
import { Table, Loading, Err, rupee } from "../components/UI";
const COLS = [
  { key:"cancellation_id", label:"ID" }, { key:"customer_name", label:"Customer" },
  { key:"property_type", label:"Property" }, { key:"booking_id", label:"Booking ID" },
  { key:"booking_date", label:"Booking Date" }, { key:"reason", label:"Reason" },
  { key:"refund_amount", label:"Refund", render:rupee },
];
export default function Cancellations() {
  const { data, loading, error } = useData(api.cancellations);
  return (
    <div className="page-inner">
      <div className="page-header"><h1 className="page-title">✕ Cancellations</h1></div>
      <div className="table-card">
        {loading && <Loading />}{error && <Err message={error} />}
        {data && <Table columns={COLS} data={data} />}
      </div>
    </div>
  );
}
