import ReportBase from "./ReportBase";
import { getVisitorsReport } from "../../../services/ServicesAdmin/ReportsService";

export default function VisitorsReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "source", label: "Source" },
    { key: "status", label: "Status" },
    { key: "visits", label: "Visits" },
  ];

  return (
    <ReportBase
      title="Visitors Report"
      description="Traffic analytics by source and audience type."
      columns={columns}
      chartLabel="Visits by date"
      fetchReport={getVisitorsReport}
    />
  );
}
