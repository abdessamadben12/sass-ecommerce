import { useEffect, useState } from 'react';

export default function UserEdit({ user, onSubmit, loading }) {
  const [formData, setFormData] = useState(user);
  const [isEditing, setIsEditing] = useState(false); // État pour verrouiller/déverrouiller
  const [verificationStatus, setVerificationStatus] = useState({
    email: false,
    twoFA: false,
  });
  const [statusValue, setStatusValue] = useState("active");

  useEffect(() => {
    if (user) {
      setFormData(user);
      setVerificationStatus({
        email: Boolean(user?.verfied_email),
        twoFA: Boolean(user?.twoFA),
      });
      setStatusValue(user?.status || "active");
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleVerification = (field) => {
    if (!isEditing) return; // Empêche le changement si on n'est pas en mode édition
    setVerificationStatus(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleCancel = () => {
    setFormData(user); // Réinitialise les données
    setIsEditing(false); // Quitte le mode édition
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      verified_email: verificationStatus.email,
      twoFA: verificationStatus.twoFA,
      status: statusValue,
    };
    onSubmit(data);
    // On peut optionnellement faire setIsEditing(false) ici après le succès
  };

  // Styles dynamiques selon l'état isEditing
  const inputStyle = `w-full px-3 py-2 border rounded-md focus:outline-none transition-all duration-200 text-gray-700 ${
    isEditing 
      ? "bg-white border-blue-300 focus:ring-2 focus:ring-blue-500 shadow-sm" 
      : "bg-gray-100 border-gray-200 cursor-not-allowed"
  }`;
  
  const labelStyle = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200">
        
        {/* Header avec bouton Activer Edition */}
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">
              Profil de <span className="text-blue-600">{user?.name}</span>
            </h1>
            <p className="text-sm text-gray-500">
              {isEditing ? "Mode édition activé" : "Consultez les informations de l'utilisateur"}
            </p>
            <div className="mt-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                  statusValue === "active"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : statusValue === "pending"
                    ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                Status: {statusValue}
              </span>
            </div>
          </div>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 font-medium transition-colors"
            >
              Modifier le profil
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* Champs Nom et Prénom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Prénom</label>
              <input
                disabled={!isEditing}
                type="text"
                value={formData?.first_name || ''}
                onChange={(e) => handleInputChange('first_name', e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Nom</label>
              <input
                disabled={!isEditing}
                type="text"
                value={formData?.last_name || ''}
                onChange={(e) => handleInputChange('last_name', e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Email et Mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Email</label>
              <input
                disabled={!isEditing}
                type="email"
                value={formData?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Téléphone</label>
              <input
                disabled={!isEditing}
                type="tel"
                value={formData?.mobile || ''}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className={labelStyle}>Adresse complète</label>
            <input
              disabled={!isEditing}
              type="text"
              value={formData?.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={inputStyle}
            />
          </div>

          {/* Ville, Code Postal, Pays */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={labelStyle}>Ville</label>
              <input
                disabled={!isEditing}
                type="text"
                value={formData?.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Code Postal</label>
              <input
                disabled={!isEditing}
                type="text"
                value={formData?.zipCode || ''}
                onChange={(e) => handleInputChange('zipCode', e.target.value)}
                className={inputStyle}
              />
            </div>
            <div>
              <label className={labelStyle}>Pays</label>
              <input
                disabled={!isEditing}
                type="text"
                value={formData?.country || ''}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className={inputStyle}
              />
            </div>
          </div>

          {/* Statut (Vérifications) */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Sécurité & Statut</h3>
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => toggleVerification('email')}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  !isEditing ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  verificationStatus.email 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-700 border-red-200'
                }`}
              >
                Email : {verificationStatus.email ? 'Vérifié' : 'Non vérifié'}
              </button>

              <button
                type="button"
                onClick={() => toggleVerification('twoFA')}
                className={`flex items-center px-4 py-2 rounded-full border text-sm font-medium transition-colors ${
                  !isEditing ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  verificationStatus.twoFA 
                    ? 'bg-blue-50 text-blue-700 border-blue-200' 
                    : 'bg-gray-50 text-gray-700 border-gray-200'
                }`}
              >
                2FA : {verificationStatus.twoFA ? 'Activé' : 'Désactivé'}
              </button>
            </div>
          </div>

          {/* Section Boutons de validation (visible uniquement en mode édition) */}

          {isEditing && (
            <div className="pt-6 border-t border-gray-100 flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 py-3 px-4 rounded-md font-semibold text-white transition-all ${
                  loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 shadow-md'
                }`}
              >
                {loading ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 rounded-md font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

