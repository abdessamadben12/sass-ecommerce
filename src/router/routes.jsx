import { Routes,Route } from "react-router-dom";
import AdminLayout from "../layouts/AdminLayout";
import Dashboard from "../roles/admin/dashbord";
import ActiveUser from "../roles/admin/manager-users/ActivUser";
import PendingUser from "../roles/admin/manager-users/PendingUser";
import BannedUser from "../roles/admin/manager-users/BannedUser";
import DetaillUser from "../roles/admin/manager-users/Action/DetaillUser";
import UserLogins from "../roles/admin/manager-users/Action/UserLogins";
import UserNotifications from "../roles/admin/manager-users/Action/UserNotifications";
import AllShop from "../roles/admin/Shops_Products/Shops/AllShops";
import AllProduct from "../roles/admin/Shops_Products/Products/AllProducts";
import ShopDetaill from "../roles/admin/Shops_Products/Shops/ShopDetaill";
import AllDeposit from "../roles/admin/Diposit/AllDeposit";
import DepositDetaill from "../roles/admin/Diposit/DepositDetaill";
import AllWithdrawals from "../roles/admin/Withdrawals/AllWithdrawals";
import WithdrawalDetaill from "../roles/admin/Withdrawals/WithdrawalDetaill";
import AllOrders from "../roles/admin/Orders/AllOreders";
import DetaillOrders from "../roles/admin/Orders/DetaillOrders";
import DetaillOrder from "../roles/admin/Orders/DetaillOrders";
import GeneralSetting from "../roles/admin/Setting/GeneralSetting";
import ProductDetaill from "../roles/admin/Shops_Products/Products/productDetaill";
import {AllTransaction} from "../roles/admin/Transaction/AllTransaction";
import DetailTransaction from "../roles/admin/Transaction/DetailTransaction";
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
import SendNotification from "../roles/admin/Notification/SendNotification";
import EmailMarketing from "../roles/admin/Marketing/EmailMarketing";
import Promotions from "../roles/admin/Marketing/Promotions";
import Coupons from "../roles/admin/Marketing/Coupons";
import Campaigns from "../roles/admin/Marketing/Campaigns";
import Referrals from "../roles/admin/Marketing/Referrals";
import Subscribers from "../roles/admin/Marketing/Subscribers";
import ProductReport from "../roles/admin/Reports/ProductReport";
import OrderReport from "../roles/admin/Reports/OrderReport";
import UserReport from "../roles/admin/Reports/UserReport";
import VisitorsReport from "../roles/admin/Reports/VisitorsReport";
import TransactionReport from "../roles/admin/Reports/TransactionReport";
import TopProductsReport from "../roles/admin/Reports/TopProductsReport";
import ActivityLogs from "../roles/admin/Logs/ActivityLogs";
import AdminProfile from "../roles/admin/Profile/AdminProfile";
import Notifications from "../roles/admin/Notification/Notifications";
import AllProfits from "../roles/admin/Profits/AllProfits";
import ProfitDetail from "../roles/admin/Profits/ProfitDetail";
import Login from "../Auth/Login";
import RequireAuth from "../Auth/RequireAuth";
import ForgotPassword from "../Auth/ForgotPassword";
import ResetPassword from "../Auth/ResetPassword";
import Home from "../roles/public/Home";


export default function  AppRouter(){
    return <Routes>
      
      <Route path="/login" element={<Login/>} />
      <Route path="/forgot-password" element={<ForgotPassword/>} />
      <Route path="/reset-password" element={<ResetPassword/>} />
      <Route path="admin/*" element ={<RequireAuth><AdminLayout/></RequireAuth> } > 
       <Route  path="dashbord" element={<Dashboard/>}/>
      <Route  path="banned-user" element={<BannedUser />}/>
      <Route  path="email-unverefied" element={<PendingUser/>}/>
      <Route  path="active-user" element={<ActiveUser/>}/> 
      <Route  path="detaill-user/:id" element={<DetaillUser/>}/> 
      <Route  path="detaill-user/login/:id" element={<UserLogins/>}/> 
      <Route  path="detaill-user/notification/:id" element={<UserNotifications/>}/> 
      {/* products & Shops */}
      <Route  path="shops" element={<AllShop/>}/>
      <Route path="shops-details/:id" element={<ShopDetail/>}/>

     {/* product */}
     <Route path="products" element={<AllProduct/>}/>
     <Route path="products/show/:id" element={<ProductDetaill/>}/>

     {/* deposit */}
     <Route path="all-deposit" element={<AllDeposit/>}/>
     <Route path="detaill-deposit/:id" element={<DepositDetaill/>}/>
     {/* withdrawals */}
     <Route path="all-withdrawals" element={<AllWithdrawals/>}/>
     <Route path="detaill-withdrawal/:id" element={<WithdrawalDetaill/>}/>
     {/* orders */}
      <Route path="all-orders" element={<AllOrders/>}/>
      <Route path="detaill-order/:id" element={<DetaillOrder/>}/>
      {/* transactions */}
      <Route path="all-transactions" element={<AllTransaction/>}/>
      <Route path="detaill-transaction/:id" element={<DetailTransaction/>}/>
      {/* settings */}
      <Route path="setting" element={<GeneralSetting/>}/>
      {/* categorie */}
      <Route path="all-categories" element={<AllCategory/>}/>
      <Route path="add-category" element={<AddCategory/>}/>
      <Route path="edit-category/:id" element={<EditCategory/>}/>
      <Route path="all-template" element={<AllTemplate/>}/>
      <Route path="all-templates" element={<AllTemplate/>}/>
      <Route path="templates-update/:id" element={<TemplateUpdateForm/>}/>
      <Route path="setting-create-templates" element={<TemplateCreator/>}/>
      <Route path="detaill-template/:id" element={<TemplateDetaill/>}/>
      {/* support */}
      <Route path="all-tickets" element={<AllTickets/>}/>
      <Route path="reply-ticket/:id" element={<ReplyTicket/>}/>
      <Route path="detaill-ticket/:id" element={<TicketDetail/>}/>
      {/* send notification */}
      <Route path="send-notification" element={<SendNotification/>}/>
      {/* marketing */}
      <Route path="email-marketing" element={<EmailMarketing/>}/>
      <Route path="promotions" element={<Promotions/>}/>
      <Route path="coupons" element={<Coupons/>}/>
      <Route path="campaigns" element={<Campaigns/>}/>
      <Route path="referrals" element={<Referrals/>}/>
      <Route path="subscribers" element={<Subscribers/>}/>
      {/* reports */}
      <Route path="product-report" element={<ProductReport/>}/>
      <Route path="order-report" element={<OrderReport/>}/>
      <Route path="user-report" element={<UserReport/>}/>
      <Route path="visitors-report" element={<VisitorsReport/>}/>
      <Route path="transaction-report" element={<TransactionReport/>}/>
      <Route path="top-products-report" element={<TopProductsReport/>}/>
      {/* logs */}
      <Route path="activity-logs" element={<ActivityLogs/>}/>
      {/* profits */}
      <Route path="profits" element={<AllProfits/>}/>
      <Route path="profits/:id" element={<ProfitDetail/>}/>
      {/* admin profile & notifications */}
      <Route path="profile" element={<AdminProfile/>}/>
      <Route path="notifications" element={<Notifications/>}/>

      </Route>
      <Route path="/file-view" element={<FileViewer/>}/>
    </Routes>

}
