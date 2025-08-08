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
import DepositDetaill from "../roles/admin/Diposit/DepositDetaill";
import AllWithdrawals from "../roles/admin/Withdrawals/AllWithdrawals";
import AllOrders from "../roles/admin/Orders/AllOreders";
import DetaillOrders from "../roles/admin/Orders/DetaillOrders";
import DetaillOrder from "../roles/admin/Orders/DetaillOrders";
import Setting from "../roles/admin/Setting/Setting";
import ProductDetaill from "../roles/admin/Shops_Products/Products/productDetaill";
import {AllTransaction} from "../roles/admin/Transaction/AllTransaction";
import AllTickets from "../roles/admin/support/ListTickets";
import ReplyTicket from "../roles/admin/support/ReplyTicket";
import TicketDetail from "../roles/admin/support/TicketDetaill";
import FileViewer from "../roles/FileView";
import TemplateCreator from "../roles/admin/Setting/Templates";
import AllTemplate from "../roles/admin/Setting/AllTemplate";
import TemplateDetaill from "../roles/admin/Setting/TemplateDetaill";
import TemplateUpdateForm from "../roles/admin/Setting/TemplateUpdate";
import AllCategory from "../roles/admin/Setting/categories/Category";
import AddCategory from "../roles/admin/Setting/categories/AddCategory";
import EditCategory from "../roles/admin/Setting/categories/EditCategory";
import ShopDetail from "../roles/admin/Shops_Products/Shops/ShopDetaill";


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
      <Route path="shops-details/:id" element={<ShopDetail/>}/>"

     {/* product */}
     <Route path="products" element={<AllProduct/>}/>
     <Route path="products/show/:id" element={<ProductDetaill/>}/>

     {/* deposit */}
     <Route path="all-deposit" element={<AllDeposit/>}/>
     <Route path="detaill-deposit/:id" element={<DepositDetaill/>}/>
     {/* withdrawals */}
     <Route path="all-withdrawals" element={<AllWithdrawals/>}/>
     {/* orders */}
      <Route path="all-orders" element={<AllOrders/>}/>
      <Route path="detaill-order/:id" element={<DetaillOrder/>}/>
      {/* transactions */}
      <Route path="all-transactions" element={<AllTransaction/>}/>
      {/* settings */}
      <Route path="setting" element={<Setting/>}/>
      {/* categorie */}
      <Route path="all-categories" element={<AllCategory/>}/>
      <Route path="add-category" element={<AddCategory/>}/>
      <Route path="edit-category/:id" element={<EditCategory/>}/>"
      <Route path="all-templates" element={<AllTemplate/>}/>
      <Route path="templates-update/:id" element={<TemplateUpdateForm/>}/>
      <Route path="setting-create-templates" element={<TemplateCreator/>}/>
      <Route path="detaill-template/:id" element={<TemplateDetaill/>}/>
      {/* support */}
      <Route path="all-tickets" element={<AllTickets/>}/>
      <Route path="reply-ticket/:id" element={<ReplyTicket/>}/>
      <Route path="detaill-ticket/:id" element={<TicketDetail/>}/>
      
      </Route>
      <Route path="/file-view" element={<FileViewer/>}/>
    </Routes>

}