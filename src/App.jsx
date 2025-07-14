
import {  BrowserRouter  } from "react-router-dom";
import AppRouter from "./router/routes";
const Dashboard = () => {
  return <BrowserRouter>
  <AppRouter/>
  </BrowserRouter>
}

export default Dashboard;