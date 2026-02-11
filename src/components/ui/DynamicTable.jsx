// DynamicTable.jsx
import { Edit, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CardConfirmation from "./CardConfirmation";

/**
 * @param {Array}   data          – tableau d’objets (lignes)
 * @param {Array}   columns       – [{ key:'name', label:'Name', render:(row)=>… } …]
 * @param {Object}  actions       – { viewPath:'/admin/users', onDelete:(id)=>{} }
 * @param {String}  emptyMessage  – texte si data.length === 0
 */
export default function DynamicTable({
  data = [],
  columns = [],
  actions = null,
  emptyMessage = "No data found",
}) {
  const navigate = useNavigate();
  const [confirmId, setConfirmId] = useState(null);

  /** Gestion du rendu d’une cellule */
  const renderCell = (row, col) => {
    // colonne custom avec fonction render
    if (col.render) return col.render(row);

    // fallback clé simple
    const value = row[col.key];
    return value !== null && value !== undefined ? value : "--";
  };

  /** Actions (View / Delete) */
  const renderActions = (rowId) =>
    actions && (
      <div className="flex items-center justify-center space-x-4">
        {actions.viewPath && (
          <button
            className="text-blue-600 hover:text-blue-800 hover:scale-110"
            onClick={() => navigate(`${actions.viewPath}/${rowId}`)}
          >
            <Eye size={24} />
          </button>
        )}

        {/* {actions.onDelete && (
          <button
            className="text-red-600 hover:text-red-800 hover:scale-110"
            onClick={() => setConfirmId(rowId)}
          >
            <Trash2 size={30} />
          </button>
        )} */}
         {actions.onEdit && (
          <button
            className="text-red-600 hover:text-red-800 hover:scale-110"
            onClick={() => setConfirmId(rowId)}
          >
            <Edit size={30} />
          </button>
        )}
      </div>
    );

  return (
    <div className="w-full overflow-x-auto rounded-lg">
      <table className="min-w-full table-auto">
        <thead className="bg-[#008ECC] text-white ">
          <tr className="font-bold">
            {columns.map((col) => (
              <th key={col.key} className="px-6 py-3 whitespace-nowrap text-center">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-6 py-3 text-center">Actions</th>}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200 bg-white text-sm text-gray-700">
          {data?.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50">
              {columns.map((col) => (
                <td key={col.key} className="px-6 py-4 whitespace-nowrap text-center">
                  {renderCell(row, col)}
                </td>
              ))}
              {actions && (
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {renderActions(row.id)}
                </td>
              )}
            </tr>
          ))}

          {data?.length === 0 && (
            <tr>
              <td colSpan={columns.length + (actions ? 1 : 0)} className="py-6 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Dialogue de confirmation */}
      {confirmId && (
        <CardConfirmation
          id={confirmId}
          nameButton="Delete"
          title="Confirm deletion"
          message="This action is irreversible. Continue?"
          isVisible={() => setConfirmId(null)}
          confirmed={() => {
            actions.onDelete(confirmId);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}
