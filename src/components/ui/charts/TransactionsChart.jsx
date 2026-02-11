import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import DateRangePicker from '../DateRangePicker';
import { getChartTransaction } from '../../../services/ServicesAdmin/ServicesDashbord';

const TransactionsReport = () => {
  const [linesVisibility, setLinesVisibility] = useState({
    plus: true,
    minus: true,
  });

  const [rawData, setRowData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const formatDate = (date) => {
    if (!date) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    async function fetchData() {
      if (!selectedDate) {
        const res = await getChartTransaction();
        setRowData(res);
        return;
      }

      const from = formatDate(selectedDate.from);
      const to = formatDate(selectedDate.to);

      if (!from || !to) return;

      const res = await getChartTransaction(from, to);
      setRowData(res);
    }

    fetchData();
  }, [selectedDate]);

  const chartData = rawData;

  const summary = useMemo(() => {
    const totals = chartData.reduce(
      (acc, row) => {
        acc.in += Number(row?.plusTransactions || 0);
        acc.out += Number(row?.minusTransactions || 0);
        return acc;
      },
      { in: 0, out: 0 }
    );

    const bestInDay = chartData.reduce(
      (best, row) => {
        const value = Number(row?.plusTransactions || 0);
        if (value > best.value) return { date: row?.date || '-', value };
        return best;
      },
      { date: '-', value: 0 }
    );

    const bestOutDay = chartData.reduce(
      (best, row) => {
        const value = Number(row?.minusTransactions || 0);
        if (value > best.value) return { date: row?.date || '-', value };
        return best;
      },
      { date: '-', value: 0 }
    );

    return {
      totalIn: totals.in,
      totalOut: totals.out,
      net: totals.in - totals.out,
      bestInDay,
      bestOutDay,
    };
  }, [chartData]);

  const handleLegendClick = (e) => {
    const key = e.dataKey;
    if (key === 'plusTransactions') {
      setLinesVisibility((prev) => ({ ...prev, plus: !prev.plus }));
    } else if (key === 'minusTransactions') {
      setLinesVisibility((prev) => ({ ...prev, minus: !prev.minus }));
    }
  };

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
        <div className="p-6 border-b border-slate-200">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">Rapport des Transactions</h1>

          <div className="flex items-center space-x-4">
            <div className="w-full relative">
              <DateRangePicker strokePeriods={(from, to) => setSelectedDate({ from, to })} />
            </div>

            {selectedDate && (
              <button onClick={() => setSelectedDate(null)} className="text-sm text-blue-600 hover:underline whitespace-nowrap">
                Reinitialiser le filtre
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-6">
          <div className="xl:col-span-2">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" stroke="#666" fontSize={12} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="#666" fontSize={12} />

                  <Tooltip
                    formatter={(value, name) => [
                      `${value} MAD`,
                      name === 'plusTransactions' ? 'Entrees' : 'Sorties',
                    ]}
                  />

                  <Legend
                    onClick={handleLegendClick}
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }}
                  />

                  <Line
                    type="monotone"
                    dataKey="plusTransactions"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                    name="Entrees"
                    hide={!linesVisibility.plus}
                  />

                  <Line
                    type="monotone"
                    dataKey="minusTransactions"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    name="Sorties"
                    hide={!linesVisibility.minus}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="xl:col-span-1">
            <div className="h-full border border-slate-200 rounded-xl p-4 bg-slate-50/70">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600 mb-4">Resume Periode</h2>

              <div className="space-y-3">
                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Entrees Totales</p>
                  <p className="text-lg font-semibold text-emerald-600">{summary.totalIn.toFixed(2)} MAD</p>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Sorties Totales</p>
                  <p className="text-lg font-semibold text-rose-600">{summary.totalOut.toFixed(2)} MAD</p>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Net</p>
                  <p className={`text-lg font-semibold ${summary.net >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
                    {summary.net.toFixed(2)} MAD
                  </p>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Meilleur Jour Entrees</p>
                  <p className="text-sm font-medium text-slate-700">{summary.bestInDay.date}</p>
                  <p className="text-sm text-emerald-600">{summary.bestInDay.value.toFixed(2)} MAD</p>
                </div>

                <div className="rounded-lg bg-white border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Meilleur Jour Sorties</p>
                  <p className="text-sm font-medium text-slate-700">{summary.bestOutDay.date}</p>
                  <p className="text-sm text-rose-600">{summary.bestOutDay.value.toFixed(2)} MAD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsReport;
