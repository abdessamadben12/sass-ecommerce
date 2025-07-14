import { Routes,Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../roles/admin/dashbord";
import ActiveUser from "../roles/admin/manager-users/ActivUser";
import PendingUser from "../roles/admin/manager-users/PendingUser";
import BannedUser from "../roles/admin/manager-users/BannedUser";
import DetaillUser from "../roles/admin/manager-users/Action/DetaillUser";
import AllShop from "../roles/admin/Shops_Products/Shops/AllShops";
import AllProduct from "../roles/admin/Shops_Products/Products/AllProducts";
import ShopDetaill from "../roles/admin/Shops_Products/Shops/ShopDetaill";
import AllDeposit from "../roles/admin/Diposit/AllDeposit";


export default function  AppRouter(){
    return <Routes>
      <Route path="admin/*" element ={<AdminLayout/> } > 
       <Route  path="dashbord" element={<Dashboard/>}/>
      <Route  path="banned-user" element={<BannedUser />}/>
      <Route  path="email-unverefied" element={<PendingUser/>}/>
      <Route  path="active-user" element={<ActiveUser/>}/> 
      <Route  path="detaill-user/:id" element={<DetaillUser/>}/> 
      {/* products & Shops */}
      <Route  path="shops" element={<AllShop/>}/>
      <Route path="shops-details/:id" element={<ShopDetaill/>}/>"

     {/* product */}
     <Route path="products" element={<AllProduct/>}/>

     {/* deposit */}
     <Route path="all-deposit" element={<AllDeposit/>}/>
      </Route>
    </Routes>

}