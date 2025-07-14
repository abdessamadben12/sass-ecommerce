import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

export default function DepositWithdrawChart({ periods, data, formatDate }) {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [showDeposits, setShowDeposits] = useState(true);
  const [showWithdraws, setShowWithdraws] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-lg font-semibold mb-2">Deposit & Withdraw Report</h3>

      {/* Period select */}
      <div className="flex items-center mb-4 space-x-2">
        <Calendar size={16} />
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {periods.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      {/* Toggle lines */}
      <div className="flex items-center mb-4 space-x-4">
        <label className="flex items-center space-x-1">
          <input type="checkbox" checked={showDeposits} onChange={() => setShowDeposits(!showDeposits)} />
          <span className="text-green-600">Deposited</span>
        </label>
        <label className="flex items-center space-x-1">
          <input type="checkbox" checked={showWithdraws} onChange={() => setShowWithdraws(!showWithdraws)} />
          <span className="text-red-600">Withdrawn</span>
        </label>
      </div>

      {/* Chart */}
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={formatDate} angle={-45} textAnchor="end" height={60} />
            <YAxis />
            <Tooltip labelFormatter={formatDate} />
            <Legend />
            {showDeposits && (
              <Line type="monotone" dataKey="deposited" name="Deposited" stroke="#10b981" strokeWidth={2} />
            )}
            {showWithdraws && (
              <Line type="monotone" dataKey="withdrawn" name="Withdrawn" stroke="#ef4444" strokeWidth={2} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
