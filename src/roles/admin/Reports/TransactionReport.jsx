import ReportBase from "./ReportBase";

export default function TransactionReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "reference", label: "Référence" },
    { key: "status", label: "Statut" },
    { key: "amount", label: "Montant" },
  ];

  const rows = [
    { id: 1, date: "2026-02-02", reference: "TRX-9001", status: "success", amount: "120.00" },
    { id: 2, date: "2026-02-03", reference: "TRX-9002", status: "pending", amount: "75.50" },
    { id: 3, date: "2026-02-06", reference: "TRX-9003", status: "failed", amount: "0.00" },
  ];

  const statusOptions = [
    { value: "success", label: "Success" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  return (
    <ReportBase
      title="Transaction Report"
      description="Analyse des transactions avec filtre par date et statut."
      columns={columns}
      rows={rows}
      statusOptions={statusOptions}
      chartKey="amount"
      chartLabel="Montant par date"
    />
  );
}
