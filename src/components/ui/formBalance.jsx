import React, { useEffect, useState } from "react";

const animationEnter = {
  opacity: 1,
  transform: "rotate(0deg)",
  transition: "all 0.5s ease-out",
};

const animationLeave = {
  opacity: 0,
  transform: "rotate(90deg)",
  transition: "all 0.4s ease-in",
};

const initialStyle = {
  opacity: 0,
  transform: "rotate(90deg)",
};

export default function BalanceModal({ onClose, onAction, title }) {
  const [amount, setAmount] = useState("");
  const [remark, setRemark] = useState("");
  const [error, setError] = useState(null);
  const [style, setStyle] = useState(initialStyle);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setStyle(animationEnter);
    }, 10);
  }, []);

  const closeWithAnimation = () => {
    setLeaving(true);
    setStyle(animationLeave);
    setTimeout(() => {
      onClose();
    }, 400); // attendre la fin de transition
  };

  const handleSubmit = async(e) => {
    e.preventDefault();

    if (!amount || parseFloat(amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setError(null);
    const data={
        amount:amount,
        remark:remark
    }
   
      onAction(data);
    closeWithAnimation();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div style={style} className="bg-white w-full max-w-md rounded-lg shadow-lg relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-700">{title}</h2>
          <button onClick={closeWithAnimation} className="text-gray-600 text-xl">
            &times;
          </button> 
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-red-500">*</span>
            </label>
            <div className="flex">
              <input
                type="number"
                placeholder="Please provide positive amount"
                className="w-full border rounded-l-md p-2 outline-none"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <span className="bg-gray-100 px-4 py-2 rounded-r-md border border-l-0 text-sm text-gray-600">
                Euro
              </span>
            </div>
            {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
          </div>

          {/* Remark */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remark <span className="text-red-500">*</span>
            </label>
            <textarea
              rows="3"
              placeholder="Remark"
              className="w-full border rounded-md p-2 outline-none"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 rounded-md"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}
