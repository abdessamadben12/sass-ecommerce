import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getTransactionById } from "../../../services/ServicesAdmin/TransactionService";
import Loading from "../../../components/ui/loading";
import NotifyError from "../../../components/ui/NotifyError";
import { ArrowLeft } from "lucide-react";

export default function DetailTransaction() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const data = await getTransactionById(id, setError);
      setTransaction(data);
      setLoading(false);
    };
    if (id) fetchData();
  }, [id]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="mb-6 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h1 className="text-2xl font-semibold text-gray-800">Transaction Detail</h1>
      </div>

      {loading ? (
        <Loading />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Trx" value={transaction?.trx ?? transaction?.id} />
            <Info label="User" value={transaction?.user?.name ?? "--"} />
            <Info label="Amount" value={transaction?.amount ?? "--"} />
            <Info label="Type" value={transaction?.trx_type ?? "--"} />
            <Info label="Remark" value={transaction?.remark ?? "--"} />
            <Info label="Status" value={transaction?.status ?? "--"} />
            <Info label="Charge" value={transaction?.charge ?? "--"} />
            <Info label="Post Balance" value={transaction?.post_balance ?? "--"} />
            <Info label="Date" value={transaction?.created_at ? String(transaction.created_at).split("T")[0] : "--"} />
          </div>
          {transaction?.details && (
            <div className="mt-6">
              <p className="text-sm font-semibold text-gray-500 mb-2">Details</p>
              <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 text-sm text-gray-700">
                {transaction.details}
              </div>
            </div>
          )}
        </div>
      )}

      <NotifyError message={error} onClose={() => setError(null)} isVisible={!!error} />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-700">{value}</p>
    </div>
  );
}
