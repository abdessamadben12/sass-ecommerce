<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\Withdrawal;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
     public function getAnnalyseUser(){
        $AllUsers = User::where('role', "!=", 'admin')->count();
        $ActiveUsers = User::where('role', "!=", 'admin')->where('status', 'active')->count();
        $UnverifiedUsers = User::where('role', "!=", 'admin')->where('email_verified_at', null)->count();
        $BlockedUsers = User::where('role', "!=", 'admin')->where('status', 'blocked')->count();

        return response()->json([
          [
            "title" => "Total Users",
            "value" => $AllUsers,
            "icon" => "Users",
            "borderColor" => " border-[1px] border-blue-500",
            "bgColor" => "bg-blue-100",
            "colorIcon" => "#0000FF",
          ],
           [
            "title" => "Active Users",
            "value" => $ActiveUsers,
            "icon" => "UserCheck",
            "borderColor" => "border-green-600/100 border-[1px]",
            "bgColor" => "bg-green-100 text-green-500",
            "colorIcon" => "#32CD32",
           

           ],
            [
            "title" => "Unverified Users",
            "value" => $UnverifiedUsers,
            "icon" => "Mail",
            "borderColor" => "border-[1px] border-orange-500",
            "bgColor" => "bg-orange-100 text-orange-500",
            "colorIcon" => "#FF8C00",
           
            ],
             [
            "title" => "Blocked Users",
            "value" => $BlockedUsers,
            "icon" => "UserX",
            "borderColor" => " border-[1px] border-red-500",
            "bgColor" => "bg-red-100 ",
            "colorIcon" => "#FF0000",
          
           
            ],
        ]);
    }
   public function getAnnalyseDeposit()
{
    $AllDeposits = Deposit::count();
    $PendingDeposits = Deposit::where('status', 'pending')->count();
    $RejectedDeposits = Deposit::where('status', 'rejected')->count();
    $chargedDeposits = Deposit::where('status', 'confirmed')->sum('amount');

    return response()->json([
        [
            "title" => "Total Deposits",
            "value" => $AllDeposits,
            "icon" => "Wallet",
            "iconColor" => "#0000FF",
            "bgColor" => "bg-blue-100",

                 ],
        [
            "title" => "Pending Deposits",
            "value" => $PendingDeposits,
            "icon" => "Clock",
            "iconColor" => "#FFD700",
            "bgColor" => "bg-yellow-100",
        ],
        [
            "title" => "diposite Charged",
            "value" => $chargedDeposits,
            "icon" => "CheckCircle",
            "iconColor" => "#32CD32",
            "bgColor" => "bg-green-100",
        ],
        [
            "title" => "Rejected Deposits",
            "value" => $RejectedDeposits,
            "icon" => "XCircle",
            "iconColor" => "#FF0000",
            "bgColor" => "bg-red-100",
        ],
    ]);
}
public function getAnnalyseWithdrawal()
{
    $AllWithdrawals = Withdrawal::all()->sum('amount');
    $PendingWithdrawals = Withdrawal::where('status', 'pending')->count();
    $withdrawlsCharged = Withdrawal::where('status', 'approved')->sum('amount');
    $RejectedWithdrawals = Withdrawal::where('status', 'rejected')->count();
    return response()->json([
        [
            "title" => "Total Withdrawals",
            "value" => $AllWithdrawals. "$",
            "icon" => "CreditCard",
            "iconColor" => "#0000FF",
            "bgColor" => "bg-blue-100",
        ],
        [
            "title" => "Pending Withdrawals",
            "value" => $PendingWithdrawals,
            "icon" => "Clock",
            "iconColor" => "#FFD700",
            "bgColor" => "bg-yellow-100",
        ],
        [
            "title" => "withdrawalCharged",
            "value" => $withdrawlsCharged."$",
            "icon" => "CheckCircle",
            "iconColor" => "#32CD32",
            "bgColor" => "bg-green-100",
        ],
        [
            "title" => "Rejected Withdrawals",
            "value" => $RejectedWithdrawals,
            "icon" => "XCircle",
            "iconColor" => "#FF0000",
            "bgColor" => "bg-red-100",
        ],
    ]);
}
 public function getViewsGlobal(){
   $orderToday = Order::whereDate('created_at', now())->count();
   $chiffreDaffaires=Order::where('status', 'completed')->sum('total_price');
   $productsPending=Product::where('status', 'pending')->count();
   $newUserToday=User::where('role', "!=", 'admin')->where('status', 'active')->where("created_at", '>=', now()->subDays(30))->count();

   return response()->json([
       [
           "title" => "Orders Today",
           "value" => $orderToday,
           "icon" => "ShoppingCart",
           "borderColor" => "border-blue-500",
           "bgColor" => "bg-blue-100",
           "colorIcon" => "#0000FF",
       ],
       [
           "title" => "Total Revenue",
           "value" => $chiffreDaffaires."$",
           "icon" => "DollarSign",
           "borderColor" => "border-green-600/100 border-[1px]",
           "bgColor" => "bg-green-100 text-green-500",
           "colorIcon" => "#32CD32",
       ],
       [
           "title" => "Pending Products",
           "value" => $productsPending,
           "icon" => "Box",
           "borderColor" => "border-orange-500 border-[1px]",
           "bgColor" => "bg-orange-100 text-orange-500",
           "colorIcon" => "#FF8C00",
       ],
       [
           "title" => "New Users Today",
           "value" => $newUserToday,
           "icon" => "Users",
           "borderColor" => "border-red-500 border-[1px]",
           "bgColor" => "bg-red-100",
           "colorIcon" => "#FF0000",
       ],
   ]);
    }
public function getDepositWithdrawChartData(){
    $startDate = now()->subDays(30);
    $endDate = now();
    $data = [];

    
    for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
        $formatted = $date->format('Y-m-d');
        $data[$formatted] = [
            'date' => $formatted,
            'deposited' => 0,
            'withdrawn' => 0,
        ];
    }

    // جلب الإيداعات
    $deposits = DB::table("deposits")
        ->selectRaw("DATE(created_at) as date, SUM(amount) as total")
        ->whereBetween("created_at", [$startDate, $endDate])
        ->groupBy('date')
        ->get();

    foreach ($deposits as $deposit) {
        $key = Carbon::parse($deposit->date)->format('Y-m-d');
        if (isset($data[$key])) {
            $data[$key]['deposited'] = $deposit->total;
        }
    }
    // جلب السحوبات
    $withdraws = DB::table('withdrawals')
        ->selectRaw('DATE(created_at) as date, SUM(amount) as total')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('date')
        ->get();

    foreach ($withdraws as $withdraw) {
        $key = Carbon::parse($withdraw->date)->format('Y-m-d');
        if (isset($data[$key])) {
            $data[$key]['withdrawn'] = $withdraw->total;
        }
    }

    // رجع البيانات كـ JSON
    return response()->json(array_values($data));
}


//  transaction report
   public function dailyTransactionsReport(Request $request)
{
    // 1. Dates From/To
    $from = $request->from && $request->from !== 'null'
        ? Carbon::parse($request->from)
        : Carbon::now()->subDays(30);

    $to = $request->to && $request->to !== 'null'
        ? Carbon::parse($request->to)
        : Carbon::now();

    // 2. Récupérer les transactions groupées par jour
    $transactions = DB::table('transactions')
        ->selectRaw("
            DATE(created_at) as date,
            SUM(CASE WHEN trx_type = '+' THEN amount ELSE 0 END) as plusTransactions,
            SUM(CASE WHEN trx_type = '-' THEN amount ELSE 0 END) as minusTransactions
        ")
        ->whereBetween('created_at', [$from->copy()->startOfDay(), $to->copy()->endOfDay()])
        ->groupBy(DB::raw("DATE(created_at)"))
        ->orderBy('date', 'asc')
        ->get();

    // 3. Re-indexation par date (Y-m-d)
    $grouped = collect($transactions)->keyBy(function ($item) {
        return Carbon::parse($item->date)->format('Y-m-d');
    });

    // 4. Générer toutes les dates entre from et to
    $allDates = collect();
    $current = $from->copy();
    while ($current <= $to) {
        $allDates->push($current->copy());
        $current->addDay();
    }

    // 5. Rapport final
    $report = $allDates->map(function ($date) use ($grouped) {

        $key = $date->format('Y-m-d');
        $data = $grouped->get($key); // <-- correction ici

        return [
            'date' => $date->format('d-F-Y'),
            'plusTransactions' => $data ? (float) $data->plusTransactions : 0,
            'minusTransactions' => $data ? (float) $data->minusTransactions : 0,
        ];
    });

    return response()->json($report);
}

    // public function getOrderWithUserChart(Request $request)
    // {
    //     $from=$request->from ==null ? Carbon::parse();
    // }

}