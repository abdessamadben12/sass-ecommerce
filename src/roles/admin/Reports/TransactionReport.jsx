import ReportBase from "./ReportBase";
import { getTransactionReport } from "../../../services/ServicesAdmin/ReportsService";

export default function TransactionReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "reference", label: "Reference" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount" },
  ];

  return (
    <ReportBase
      title="Transaction Report"
      description="Transaction performance with date and status filters."
      columns={columns}
      chartLabel="Amount by date"
      fetchReport={getTransactionReport}
      valueType="currency"
    />
  );
}
