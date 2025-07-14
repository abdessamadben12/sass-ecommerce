import React, { useEffect, useState } from 'react';
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
import Calendarie from '../Calendries'; // تقويمك
import { getChartTransaction } from '../../../services/ServicesAdmin/ServicesDashbord';

const TransactionsReport = () => {
  const [linesVisibility, setLinesVisibility] = useState({
    plus: true,
    minus: true,
  }); 
  const [rawData,setRowData]=useState([])
  const [selectedDate, setSelectedDate] = useState(null); // التاريخ المُخزن للفلاتر
  useEffect(()=>{
    async function fetchData(){
      const res=await getChartTransaction()
      setRowData(res)

    }
    fetchData()
  },[])
  const chartData = selectedDate
    ? rawData.filter(item => item.date === selectedDate)
    : rawData;

  const handleLegendClick = (e) => {
    const key = e.dataKey;
    if (key === 'plusTransactions') {
      setLinesVisibility(prev => ({ ...prev, plus: !prev.plus }));
    } else if (key === 'minusTransactions') {
      setLinesVisibility(prev => ({ ...prev, minus: !prev.minus }));
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm">
        {/* En-tête */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            Rapport des Transactions
          </h1>

          {/* Sélecteur de date */}
          <div className="flex items-center space-x-4">
            <div className="w-full relative">
              {/* Calendarie devrait appeler setSelectedDate avec un format cohérent */}
              <Calendarie onChange={(date) => setSelectedDate(date)} />
            </div>
            {selectedDate && (
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-blue-600 hover:underline"
              >
                Réinitialiser le filtre
              </button>
            )}
          </div>
        </div>

        {/* Graphique */}
        <div className="flex">
          <div className="flex-1 p-6">
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    stroke="#666"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="#666" fontSize={12} />
                  <Tooltip
                    formatter={(value, name) => [
                      `${value} MAD`,
                      name === 'plusTransactions' ? 'Entrées' : 'Sorties',
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
                    name="Entrées"
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
        </div>
      </div>
    </div>
  );
};

export default TransactionsReport;
