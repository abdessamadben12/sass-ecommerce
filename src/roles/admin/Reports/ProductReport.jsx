import ReportBase from "./ReportBase";
import { getProductReport } from "../../../services/ServicesAdmin/ReportsService";

export default function ProductReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "product", label: "Product" },
    { key: "status", label: "Status" },
    { key: "sales", label: "Sales" },
  ];

  return (
    <ReportBase
      title="Product Report"
      description="Product performance with status and date filters."
      columns={columns}
      chartLabel="Sales by date"
      fetchReport={getProductReport}
    />
  );
}
