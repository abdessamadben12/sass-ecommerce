// src/pages/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Mail, Calendar } from 'lucide-react';
import { getOrderDetails } from '../../../services/ServicesAdmin/ordersServices';
import Loading from '../../../components/ui/loading';

export default function DetaillOrder() {
  const { id } = useParams();
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getOrderDetails(id, setError);
        setOrder(data);
      } catch (err) {
        setError('Impossible de récupérer la commande.');
      }
    };
    fetchData();
  }, [id]);

  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!order) return <div className="p-8"><Loading/></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Retour aux commandes */}
      <Link to="/admin/all-orders" className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
        <ArrowLeft size={18} className="mr-2" /> Retour aux commandes
      </Link>

      {/* En-tête de la commande */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Commande #{order.id}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
            <span className="flex items-center">
              <Calendar size={14} className="mr-1" />{' '}
              {new Date(order.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
            <span className="flex items-center">
              <Mail size={14} className="mr-1" /> {order.custemer}
            </span>
          </div>
        </div>
        <StatusBadge status={capitalizeFirstLetter(order.status)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Produits numériques */}
        <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700">
            Produits Numériques
          </div>
          <div className="p-6 space-y-4">
            {
            order.items?.map((item, index) => (
              <div
                key={index}
                className="flex justify-between items-center p-4 border rounded-lg hover:border-indigo-200 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">{item.title}</h4>
                  <span className="text-xs text-gray-500 uppercase bg-gray-100 px-2 py-0.5 rounded">
                    {getFileType(item.main_file_path)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 mb-1">{item.base_price}€</p>
                  {order.status.toLowerCase() === 'completed' ? (
                    <a
                      href={item.main_file_path}
                      download
                      className="flex items-center text-xs text-indigo-600 hover:underline"
                    >
                      <Download size={14} className="mr-1" /> Télécharger
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Attente paiement</span>
                  )}
                </div>
              </div>
            ))}
            {
              order.items?.length === 0 && (
                <div className="p-6 text-center">
                  <p className="text-gray-500">Aucun produit trouvé</p>
                </div>
              )
            }
          </div>
          <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <span className="font-medium text-gray-600">Total payé</span>
            <span className="text-xl font-bold text-gray-900">{order.total}€</span>
          </div>
        </div>

        {/* Info client */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-fit">
          <h3 className="font-semibold text-gray-800 mb-4">Client</h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                {order.custemer.charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900">{order.custemer}</p>
                <p className="text-sm text-gray-500">{order.custemer_email}</p>
              </div>
            </div>
            <hr className="border-gray-100" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant auxiliaire
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getFileType(filePath) {
  const ext = filePath.split('.').pop();
  return ext.toUpperCase();
}


// src/components/StatusBadge.jsx

// Petit composant pour afficher joliment les statuts
 function StatusBadge({ status }) {
 const styles = {
  Completed: 'bg-green-100 text-green-700',
  Succeeded: 'bg-green-100 text-green-700',
  Processing: 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Failed: 'bg-red-100 text-red-700',
  Declined: 'bg-red-100 text-red-700',
  Cancelled: 'bg-red-100 text-red-700', // ajouté
};

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
}