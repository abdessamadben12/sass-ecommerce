import ReportBase from "./ReportBase";

export default function ProductReport() {
  const columns = [
    { key: "date", label: "Date" },
    { key: "product", label: "Produit" },
    { key: "status", label: "Statut" },
    { key: "sales", label: "Ventes" },
  ];

  const rows = [
    { id: 1, date: "2026-02-01", product: "Template A", status: "active", sales: 120 },
    { id: 2, date: "2026-02-03", product: "Template B", status: "inactive", sales: 34 },
    { id: 3, date: "2026-02-05", product: "Template C", status: "pending", sales: 56 },
  ];

  const statusOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "pending", label: "Pending" },
  ];

  return (
    <ReportBase
      title="Product Report"
      description="Analyse des produits avec filtre par date et statut."
      columns={columns}
      rows={rows}
      statusOptions={statusOptions}
      chartKey="sales"
      chartLabel="Ventes par date"
    />
  );
}
