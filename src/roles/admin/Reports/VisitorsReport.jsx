import ReportBase from "./ReportBase";

export default function VisitorsReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "source", label: "Source" },
    { key: "status", label: "Statut" },
    { key: "visits", label: "Visites" },
  ];

  const rows = [
    { id: 1, date: "2026-02-01", source: "Google", status: "active", visits: 540 },
    { id: 2, date: "2026-02-04", source: "Direct", status: "active", visits: 320 },
    { id: 3, date: "2026-02-06", source: "Ads", status: "blocked", visits: 40 },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "blocked", label: "Blocked" },
  ];

  return (
    <ReportBase
      title="Visitors Report"
      description="Analyse des visiteurs avec filtre par date et statut."
      columns={columns}
      rows={rows}
      statusOptions={statusOptions}
      chartKey="visits"
      chartLabel="Visites par date"
    />
  );
}
