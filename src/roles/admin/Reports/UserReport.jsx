import ReportBase from "./ReportBase";

export default function UserReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "email", label: "Email" },
    { key: "status", label: "Statut" },
    { key: "role", label: "Rôle" },
  ];

  const rows = [
    { id: 1, date: "2026-02-01", email: "user1@example.com", status: "active", role: "buyer" },
    { id: 2, date: "2026-02-03", email: "seller1@example.com", status: "pending", role: "seller" },
    { id: 3, date: "2026-02-05", email: "user2@example.com", status: "banned", role: "buyer" },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "pending", label: "Pending" },
    { value: "banned", label: "Banned" },
  ];

  return (
    <ReportBase
      title="User Report"
      description="Analyse des utilisateurs avec filtre par date et statut."
      columns={columns}
      rows={rows}
      statusOptions={statusOptions}
      chartKey="id"
      chartLabel="Inscriptions par date"
    />
  );
}
