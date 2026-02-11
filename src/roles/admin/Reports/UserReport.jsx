import ReportBase from "./ReportBase";
import { getUserReport } from "../../../services/ServicesAdmin/ReportsService";

export default function UserReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "email", label: "Email" },
    { key: "status", label: "Status" },
    { key: "role", label: "Role" },
  ];

  return (
    <ReportBase
      title="User Report"
      description="User registrations and status trend."
      columns={columns}
      chartLabel="Registrations by date"
      fetchReport={getUserReport}
    />
  );
}
