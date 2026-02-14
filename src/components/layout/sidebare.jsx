import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

export function Sidebare({ items, logoUrl, appName, isOpen: controlledOpen, setIsOpen: setControlledOpen }) {
  const [activeSubmenu, setActiveSubmenu] = useState(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const location = useLocation();

  const isControlled = typeof controlledOpen === "boolean" && typeof setControlledOpen === "function";
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const setIsOpen = isControlled ? setControlledOpen : setInternalOpen;

  const normalizePath = (path = "") => path.replace(/\/+$/, "") || "/";
  const currentPath = normalizePath(location.pathname);

  const matchedParent = useMemo(() => {
    return (
      items.find(
        (item) =>
          Array.isArray(item.children) &&
          item.children.some((child) => normalizePath(child.link) === currentPath)
      ) || null
    );
  }, [items, currentPath]);

  useEffect(() => {
    if (matchedParent?.name) {
      setActiveSubmenu(matchedParent.name);
    }
  }, [matchedParent]);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen || window.innerWidth >= 1024) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const onEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [setIsOpen]);

  return (
    <>
      {!isControlled && (
        <button
          className="lg:hidden fixed top-3 left-3 z-[60] p-2 bg-white shadow-md rounded-lg"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isOpen}
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-[85vw] max-w-72 bg-white border-r border-gray-100
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen lg:w-72 flex flex-col
        `}
      >
        <div className="px-5 sm:px-6 py-5 sm:py-7 flex items-center gap-3 border-b border-gray-50">
          {logoUrl ? (
            <img src={logoUrl} alt={appName || "logo"} className="h-16 w-16 sm:h-16 sm:w-16 object-contain" />
          ) : null}
         
        </div>

        <nav className="flex-1 px-3 sm:px-5 py-3 space-y-1.5 overflow-y-auto custom-scrollbar">
          {items.map((item, idx) => {
            const isLinkActive = item.link ? normalizePath(item.link) === currentPath : false;
            const isChildActive =
              Array.isArray(item.children) &&
              item.children.some((child) => normalizePath(child.link) === currentPath);
            const isActive = isLinkActive || isChildActive || activeSubmenu === item.name;

            const NavItemContent = (
              <div
                onClick={() => item.hasSubmenu && setActiveSubmenu(activeSubmenu === item.name ? null : item.name)}
                className={`
                  flex items-center justify-between px-3.5 sm:px-4 py-3 rounded-xl sm:rounded-2xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-[#0ea5e9] text-white shadow-lg shadow-blue-200"
                      : "text-slate-400 hover:text-slate-600 hover:bg-gray-50"
                  }
                  cursor-pointer group
                `}
              >
                <div className="flex items-center space-x-4">
                  <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  <span className={`text-sm sm:text-[15px] font-medium ${isActive ? "text-white" : "text-slate-500"}`}>
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

                {item.children && activeSubmenu === item.name && (
                  <div className="mt-1.5 ml-9 sm:ml-11 space-y-1 animate-in fade-in slide-in-from-top-1">
                    {item.children.map((child, i) => (
                      <Link
                        key={i}
                        to={child.link}
                        onClick={() => setIsOpen(false)}
                        className={`block py-1.5 text-xs sm:text-sm transition-colors ${
                          normalizePath(child.link) === currentPath
                            ? "text-[#0ea5e9] font-semibold"
                            : "text-slate-500 hover:text-[#0ea5e9]"
                        }`}
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

        <div className="px-5 sm:px-6 py-5 border-t border-gray-50">
          <p className="text-[11px] font-bold text-slate-300 tracking-[0.1em] uppercase">Realvest v2.1.1</p>
        </div>
      </aside>
    </>
  );
}
