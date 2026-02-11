import ReportBase from "./ReportBase";
import { getOrderReport } from "../../../services/ServicesAdmin/ReportsService";

export default function OrderReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "reference", label: "Reference" },
    { key: "customer_email", label: "Customer" },
    { key: "status", label: "Status" },
    { key: "amount", label: "Amount" },
  ];

  return (
    <ReportBase
      title="Order Report"
      description="Orders analytics with date and status filters."
      columns={columns}
      chartLabel="Revenue by date"
      fetchReport={getOrderReport}
      valueType="currency"
    />
  );
}
