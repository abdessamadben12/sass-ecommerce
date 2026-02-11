import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  approveDeposit,
  getDepositById,
  rejectDeposit,
} from "../../../services/ServicesAdmin/DepositService";
import NotifyError from "../../../components/ui/NotifyError";
import { NotifySuccess } from "../../../components/ui/NotifySucces";

export default function DepositDetaill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getDepositById(id);
      setDeposit(data);
    } catch (err) {
      setError(err?.message || "Erreur de chargement.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    load();
  }, [id]);

  const handleApprove = async () => {
    setError("");
    setSuccess("");
    try {
      await approveDeposit(id);
      setSuccess("Deposit confirmé.");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur.");
    }
  };

  const handleReject = async () => {
    setError("");
    setSuccess("");
    try {
      await rejectDeposit(id, rejectReason);
      setSuccess("Deposit rejeté.");
      load();
    } catch (err) {
      setError(err?.response?.data?.message || "Erreur.");
    }
  };

  if (loading) return <div className="p-6">Chargement...</div>;
  if (!deposit) return <div className="p-6">Aucune donnée.</div>;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Deposit Detail</h1>
        <button
          className="text-sm text-gray-600 underline"
          onClick={() => navigate(-1)}
        >
          Retour
        </button>
      </div>

      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">User:</span>{" "}
            <span className="font-medium">{deposit?.user?.name ?? "--"}</span>
          </div>
          <div>
            <span className="text-gray-500">Email:</span>{" "}
            <span className="font-medium">{deposit?.user?.email ?? "--"}</span>
          </div>
          <div>
            <span className="text-gray-500">Amount:</span>{" "}
            <span className="font-medium">{deposit?.amount}</span>
          </div>
          <div>
            <span className="text-gray-500">Method:</span>{" "}
            <span className="font-medium">{deposit?.payment_method}</span>
          </div>
          <div>
            <span className="text-gray-500">Transaction:</span>{" "}
            <span className="font-medium">{deposit?.transaction_id || "-"}</span>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>{" "}
            <span className="font-medium">{deposit?.status}</span>
          </div>
          <div>
            <span className="text-gray-500">Created:</span>{" "}
            <span className="font-medium">{deposit?.created_at}</span>
          </div>
          <div>
            <span className="text-gray-500">Notes:</span>{" "}
            <span className="font-medium">{deposit?.notes || "-"}</span>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-end">
          <div className="flex-1">
            <label className="text-sm text-gray-600">Motif de rejet (optionnel)</label>
            <input
              className="w-full border rounded px-3 py-2 mt-1"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison..."
            />
          </div>
          <div className="flex gap-2">
            <button
              className="px-4 py-2 rounded bg-green-600 text-white"
              onClick={handleApprove}
              disabled={deposit?.status !== "pending"}
            >
              Confirmer
            </button>
            <button
              className="px-4 py-2 rounded bg-red-600 text-white"
              onClick={handleReject}
              disabled={deposit?.status !== "pending"}
            >
              Rejeter
            </button>
          </div>
        </div>
      </div>

      <NotifyError message={error} onClose={() => setError("")} isVisible={!!error} />
      {success ? (
        <NotifySuccess message={success} sucess={true} onClose={() => setSuccess("")} />
      ) : null}
    </div>
  );
}
