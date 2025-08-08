import { useEffect, useState } from 'react';

export default function UserEdit({user,onSubmit,loading}) {
  const [formData, setFormData] = useState(user);
  const [verificationStatus, setVerificationStatus] = useState({
    email: user?.verfied_email,
    twoFA: user?.twoFA, 
  });
  const [isSubmitting, setIsSubmitting] = useState(loading);
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
 useEffect(() => {
  if (user) {
    setFormData(user);
    setVerificationStatus({
      email: user.verified_email ?? false,
      twoFA: user.twoFA ?? false,
    });
  }
}, [user]);
  const toggleVerification = (field) => {
    setVerificationStatus(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };
  const handleSubmit = async () => {
    const data={
        ...formData,verified_email:verificationStatus.email,twoFA:verificationStatus.twoFA
    }
      onSubmit(data)
  };
  console.log(verificationStatus)
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-lg border border-white/20">
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Information of{" "+user?.name}
          </h1>
      
      <div className="space-y-8">
        {/* First Name and Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData?.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData?.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
        </div>
        {/* Email and Mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="flex rounded" >
              
              <input
                type="tel"
                value={formData?.mobile}
                onChange={(e) => handleInputChange('mobile', e.target.value)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">Address</label>
          <input
            type="text"
            value={formData?.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
          />
        </div>

        {/* City, State, Zip, Country */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">City</label>
            <input
              type="text"
              value={formData?.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">State</label>
            <input
              type="text"
              value={formData?.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">Zip/Postal</label>
            <input
              type="text"
              value={formData?.zipCode}
              onChange={(e) => handleInputChange('zipCode', e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm"
            />
          </div>
          <div className="group">
            <label className="block text-sm font-semibold text-gray-700 mb-3 transition-colors group-focus-within:text-blue-600">
              Country <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                value={formData?.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300 hover:border-gray-300 bg-gray-50/50 backdrop-blur-sm appearance-none"
              />
            </div>
          </div>
        </div>
        {/* Verification Buttons */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Verification Status</h3>
          <div className="grid grid-cols-2  gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Email Verification</label>
              <button
                onClick={() => toggleVerification('email')}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${
                  verificationStatus.email
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200 hover:shadow-green-300'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200 hover:shadow-red-300'
                } shadow-lg`}
              >
                {verificationStatus.email ? ' Verified' : 'Unverified'}
              </button>
            </div>
         
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">2FA Verification</label>
              <button
                onClick={() => toggleVerification('twoFA')}
                className={`w-full px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 ${
                  verificationStatus.twoFA
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-200 hover:shadow-green-300'
                    : 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-red-200 hover:shadow-red-300'
                } shadow-lg`}
              >
                {verificationStatus.twoFA ? 'Enabled' : 'Disable'}
              </button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`w-full py-4 px-8 rounded-2xl font-bold text-lg transition-all duration-500 transform shadow-2xl ${
              isSubmitting
                ? 'bg-gradient-to-r from-gray-400 to-gray-500 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-400 via-purple-500 to-blue-400 hover:from-blue-500 hover:via-purple-600 hover:to-blue-500 text-white hover:scale-105 hover:shadow-blue-500/25 active:scale-95'
            } focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-opacity-50`}
          >
            <div className="flex items-center justify-center space-x-3">
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-sm">→</span>
                  </div>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
        </div>
      </div>
    </div>
  );
}