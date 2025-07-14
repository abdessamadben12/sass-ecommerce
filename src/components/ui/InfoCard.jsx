
const InfoCard = ({ icon, title, rows }) => (
  <div className="bg-white rounded-lg shadow-sm p-6">
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
    </div>
    <div className="space-y-4">
      {rows.map((row, idx) => (
        <div key={idx} className="flex justify-between items-center">
          <span className="text-gray-600">{row.label}</span>
          {row.badge ? (
            <span className={`flex items-center gap-2 px-3 py-1 bg-${row.badge}-100 text-${row.badge}-800 rounded-full text-sm`}>
              {row.icon}
              {row.value}
            </span>
          ) : (
            <span className={`font-medium ${row.color || 'text-gray-800'}`}>{row.value}</span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default InfoCard;