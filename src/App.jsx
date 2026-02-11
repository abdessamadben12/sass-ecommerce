
import {  BrowserRouter  } from "react-router-dom";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import AppRouter from "./router/routes";
const Dashboard = () => {
  return (
    <AppSettingsProvider>
      <BrowserRouter>
        <AppRouter/>
      </BrowserRouter>
    </AppSettingsProvider>
  );
}

export default Dashboard;
