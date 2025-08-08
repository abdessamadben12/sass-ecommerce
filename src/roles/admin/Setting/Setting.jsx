import React from 'react';
import { Search, Settings, Monitor, Cog, Bell, CreditCard, Building2, Link, Building2Icon, BuildingIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Setting = () => {
    const navigate = useNavigate();
  const settingsCards = [
    {
      icon: <Settings className="w-8 h-8 text-white" />,
      title: "General Setting",
      description: "Configure the fundamental information of the site.",
      bgColor: "bg-blue-600",
        link: "general-setting"
    },
    {
      icon: <Monitor className="w-8 h-8 text-white" />,
      title: "Logo and Favicon",
      description: "Upload your logo and favicon here.",
        bgColor: "bg-blue-600",
      link: "logo-and-favicon"
    },
    {
      icon: <Cog className="w-8 h-8 text-white" />,
      title: "System Configuration",
      description: "Control all of the basic modules of the system.",
      bgColor: "bg-blue-600"
    },
    {
      icon: <Bell className="w-8 h-8 text-white" />,
      title: "Notification Setting",
      description: "Control and configure overall notification elements of the system.",
      bgColor: "bg-blue-600"
    },
    {
      icon: <BuildingIcon className="w-8 h-8 text-white" />,
      title: "Categories",
      description: "Configure automatic or manual payment gateways to accept payment from users.",
      bgColor: "bg-blue-600",
      link: "categories"
    },
    {
      icon: <Building2 className="w-8 h-8 text-white" />,
      title: "Withdrawals Methods",
      description: "Setup manual withdrawal method so that users of the system can make payout requests through those methods.",
      bgColor: "bg-blue-600"
    }
  ];
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-8">System Settings</h1>
        
        {/* Search Bar */}
        <div className="relative mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-12 pr-4 py-4 border-2 border-blue-200 rounded-lg focus:outline-none focus:border-blue-400 transition-colors duration-200 text-gray-600"
            placeholder="Search..."
          />
        </div>
        {/* Settings Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settingsCards.map((card, index) => (
            <div
              onClick={() => navigate(`/admin/setting/${card.link}`)}
              key={index}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 p-6 cursor-pointer group border border-gray-100"
            >
              <div className="flex items-start space-x-4">
                {/* Icon Container */}
                <div className={`${card.bgColor} rounded-lg p-4 flex-shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                  {card.icon}
                </div>
                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors duration-200">
                    {card.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
              {/* Decorative Elements */}
              <div className="absolute top-4 right-4 opacity-10">
                <div className="w-20 h-20 bg-blue-100 rounded-full"></div>
              </div>
              <div className="absolute bottom-4 right-8 opacity-5">
                <div className="w-16 h-16 bg-blue-200 rounded-full"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Setting;
