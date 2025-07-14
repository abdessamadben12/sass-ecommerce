import { ChevronDown, KeyRound, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function Sidebare({ items }) {
  const [active, setActiveSection] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Bouton mobile */}
      <button
        className="absolute top-4 left-4 z-50 text-indigo-900 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 w-64 bg-indigo-900 text-white shadow-xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:static
          flex flex-col   
          h-screen        
          z-50
        `}
      >
        {/* — Logo / Brand — */}
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">W</span>
          </div>
          <span className="text-xl font-bold">WIN GLOBAL</span>
        </div>

        {/* — Navigation (scrollable) — */}
        <nav className="flex-1 overflow-y-auto">
          {items.map((item, idx) => (
            <div key={idx}>
              {item.link ? <Link
                to={item.link}                 
                className={`
                  flex items-center justify-between px-6 py-3
                  hover:bg-indigo-800 cursor-pointer transition-colors
                  ${active === item.name ? "bg-indigo-800 border-r-4 border-cyan-400" : ""}
                `}
                onClick={() =>
                  setActiveSection(active === item.name ? null : item.name)
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
                  {item.hasSubmenu && (
                    <ChevronDown
                      className={`
                        w-4 h-4 transform transition-transform duration-300
                        ${active === item.name ? "rotate-180" : ""}
                      `}
                    />
                  )}
                </div>
              </Link> :  <div          
                className={`
                  flex items-center justify-between px-6 py-3
                  hover:bg-indigo-800 cursor-pointer transition-colors
                  ${active === item.name ? "bg-indigo-800 border-r-4 border-cyan-400" : ""}
                `}
                onClick={() =>
                  setActiveSection(active === item.name ? null : item.name)
                }
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {item.badge && <div className="w-2 h-2 bg-orange-400 rounded-full" />}
                  {item.hasSubmenu && (
                    <ChevronDown
                      className={`
                        w-4 h-4 transform transition-transform duration-300
                        ${active === item.name ? "rotate-180" : ""}
                      `}
                    />
                  )}
                </div>
              </div>}
              

              {item.children && active === item.name && (
                <div className="ml-12   space-y-1 transition-all duration-300">
                  {item.children.map((child, i) => (
                    <div
                      key={i}
                      className="text-sm text-indigo-200 hover:text-white cursor-pointer flex  items-center gap-2 p-2 mt-2"
                    >
                      
                      {<Link to={child.link}>{child.name}</Link>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* — Footer version (toujours en bas) — */}
        <div className="px-6 py-4 text-xs text-indigo-300 mt-auto">
          REALVEST V2.1.1
        </div>
      </aside>
    </div>
  );
}
