import { ChevronDown, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebare({ items, logoUrl, appName }) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Toggle */}
      <button
        className="lg:hidden fixed top-5 left-5 z-[60] p-2 bg-white shadow-md rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X /> : <Menu />}
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static flex flex-col h-screen
        `}
      >
        {/* — Logo — */}
        <div className="px-10 py-10 flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={appName || "logo"} className="h-10 w-10 object-contain" />
          ) : null}
          
        </div>

        {/* — Navigation — */}
        <nav className="flex-1 px-6 space-y-2 overflow-y-auto custom-scrollbar">
          {items.map((item, idx) => {
            // On vérifie si l'item est actif (via le lien ou si le sous-menu est ouvert)
            const isActive = location.pathname === item.link || activeSubmenu === item.name;

            const NavItemContent = (
              <div
                onClick={() => item.hasSubmenu && setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                className={`
                  flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200
                  ${isActive 
                    ? "bg-[#0ea5e9] text-white shadow-lg shadow-blue-200" 
                    : "text-slate-400 hover:text-slate-600 hover:bg-gray-50"}
                  cursor-pointer group
                `}
              >
                <div className="flex items-center space-x-4">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-[15px] font-medium ${isActive ? "text-white" : "text-slate-500"}`}>
                    {item.name}
                  </span>
                </div>
                
                {item.hasSubmenu && (
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${activeSubmenu === item.name ? "rotate-180" : ""}`}
                  />
                )}
              </div>
            );

            return (
              <div key={idx} className="pb-1">
                {item.link && !item.hasSubmenu ? (
                  <Link to={item.link} onClick={() => setIsOpen(false)}>
                    {NavItemContent}
                  </Link>
                ) : (
                  NavItemContent
                )}

                {/* Submenu rendering */}
                {item.children && activeSubmenu === item.name && (
                  <div className="mt-2 ml-12 space-y-2 animate-in fade-in slide-in-from-top-1">
                    {item.children.map((child, i) => (
                      <Link
                        key={i}
                        to={child.link}
                        onClick={() => setIsOpen(false)}
                        className="block py-2 text-sm text-slate-500 hover:text-[#0ea5e9] transition-colors"
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* — Footer — */}
        <div className="px-10 py-8">
          <p className="text-[11px] font-bold text-slate-300 tracking-[0.1em] uppercase">
            Realvest v2.1.1
          </p>
        </div>
      </aside>
    </>
  );
}
