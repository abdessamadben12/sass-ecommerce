import React, { useState } from 'react';
import ChartCard from './ChartCard';
import DepositWithdrawChart from './DepositWithdrawChart';
import TransactionChart from './TransactionChart';

const periods = [
  'June 14, 2025 - June 28, 2025',
  'June 1, 2025 - June 30, 2025',
  'Last 7 days',
  'Last 30 days',
];

const depositWithdrawData = [ /* ... */ ];
const transactionData = [ /* ... */ ];

const formatDate = (isoDate) => {
  const d = new Date(isoDate);
  return `${d.getDate()}-Jun`;
};

export default function DashboardReports() {
  const [selectedPeriod, setSelectedPeriod] = useState(periods[0]);
  const [showDeposits, setShowDeposits] = useState(true);
  const [showWithdraws, setShowWithdraws] = useState(true);
  const [showPlus, setShowPlus] = useState(true);
  const [showMinus, setShowMinus] = useState(true);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 bg-gray-50 min-h-screen">
      
      <ChartCard
        title="Deposit & Withdraw Report"
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        periods={periods}
        filters={
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
        }
      >
        <DepositWithdrawChart
          data={depositWithdrawData}
          showDeposits={showDeposits}
          showWithdraws={showWithdraws}
          formatDate={formatDate}
        />
      </ChartCard>

      <ChartCard
        title="Transactions Report"
        selectedPeriod={selectedPeriod}
        setSelectedPeriod={setSelectedPeriod}
        periods={periods}
        filters={
          <div className="flex items-center mb-4 space-x-4">
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={showPlus} onChange={() => setShowPlus(!showPlus)} />
              <span className="text-green-600">Plus Transactions</span>
            </label>
            <label className="flex items-center space-x-1">
              <input type="checkbox" checked={showMinus} onChange={() => setShowMinus(!showMinus)} />
              <span className="text-red-600">Minus Transactions</span>
            </label>
          </div>
        }
      >
        <TransactionChart
          data={transactionData}
          showPlus={showPlus}
          showMinus={showMinus}
          formatDate={formatDate}
        />
      </ChartCard>

    </div>
  );
}
