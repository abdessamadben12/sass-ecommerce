import React, { createContext, useContext, useEffect, useState } from "react";
import { getGeneralSettings } from "../services/ServicesAdmin/SettingsService";

const AppSettingsContext = createContext({
  appName: "",
  logoUrl: "",
  faviconUrl: "",
  currency: "USD",
  formatCurrency: (value) => value,
  refreshSettings: async () => {},
});

export function AppSettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    appName: "",
    logoUrl: "",
    faviconUrl: "",
    currency: "USD",
  });

  const load = async () => {
      try {
        const general = await getGeneralSettings();
        const appName = general?.app_name || "";
        const logoUrl = general?.logo_url || "";
        const faviconUrl = general?.favicon_url || "";
        const currency = general?.default_currency || "USD";
        setSettings({ appName, logoUrl, faviconUrl, currency });

        if (appName) document.title = appName;
        if (faviconUrl) {
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            document.head.appendChild(link);
          }
          link.href = faviconUrl;
        }
      } catch {
        // ignore settings load errors
      }
    };

  useEffect(() => {
    load();
  }, []);

  const formatCurrency = (value) => {
    const number = Number(value);
    if (Number.isNaN(number)) return value ?? "--";
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: settings.currency || "USD",
      maximumFractionDigits: 2,
    }).format(number);
  };

  return (
    <AppSettingsContext.Provider
      value={{
        appName: settings.appName,
        logoUrl: settings.logoUrl,
        faviconUrl: settings.faviconUrl,
        currency: settings.currency,
        formatCurrency,
        refreshSettings: load,
      }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
}

export function useAppSettings() {
  return useContext(AppSettingsContext);
}
