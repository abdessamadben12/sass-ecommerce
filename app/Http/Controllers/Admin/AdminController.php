<?php

namespace App\Http\Controllers\Admin;

use Carbon\Carbon;
use App\Models\User;
use App\Models\Order;
use App\Models\Deposit;
use App\Models\Product;
use App\Models\Withdrawal;
use App\Models\CommissionSetting;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function dashboardOverview()
    {
        $payload = Cache::remember('dashboard:overview:v1', 30, function () {
            $users = DB::table('users')
                ->selectRaw("
                    SUM(CASE WHEN role != 'admin' THEN 1 ELSE 0 END) as total_users,
                    SUM(CASE WHEN role != 'admin' AND status = 'active' THEN 1 ELSE 0 END) as active_users,
                    SUM(CASE WHEN role != 'admin' AND email_verified_at IS NULL THEN 1 ELSE 0 END) as unverified_users,
                    SUM(CASE WHEN role != 'admin' AND status IN ('inactive', 'blocked') THEN 1 ELSE 0 END) as blocked_users
                ")
                ->first();

            $deposits = DB::table('deposits')
                ->selectRaw("
                    COUNT(*) as total_deposits,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_deposits,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_deposits,
                    COALESCE(SUM(CASE WHEN status = 'confirmed' THEN amount ELSE 0 END), 0) as charged_deposits
                ")
                ->first();

            $withdrawals = DB::table('withdrawals')
                ->selectRaw("
                    COALESCE(SUM(amount), 0) as total_withdrawals_amount,
                    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_withdrawals,
                    COALESCE(SUM(CASE WHEN status = 'approved' THEN amount ELSE 0 END), 0) as charged_withdrawals_amount,
                    SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected_withdrawals
                ")
                ->first();

            $globals = DB::table('orders')
                ->selectRaw("
                    SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as orders_today,
                    COALESCE(SUM(CASE WHEN status = 'completed' THEN total_price ELSE 0 END), 0) as total_revenue
                ")
                ->first();

            $pendingProducts = DB::table('products')->where('status', 'pending')->count();
            $newUsersToday = DB::table('users')
                ->where('role', '!=', 'admin')
                ->whereDate('created_at', now())
                ->count();

            $sellerGrossSales = (float) DB::table('order_items as oi')
                ->join('orders as o', 'o.id', '=', 'oi.order_id')
                ->join('products as p', 'p.id', '=', 'oi.product_id')
                ->join('shops as s', 's.id', '=', 'p.shop_id')
                ->join('users as u', 'u.id', '=', 's.user_id')
                ->where('u.role', 'seller')
                ->whereIn('o.status', ['paid', 'shipped', 'completed'])
                ->sum(DB::raw('oi.quantity * oi.price'));

            $commissionSetting = CommissionSetting::query()->first();
            $platformPercent = (float) ($commissionSetting?->platform_percent ?? 0);
            if ($platformPercent <= 0 && (float) ($commissionSetting?->seller_percent ?? 0) > 0) {
                $platformPercent = max(0, 100 - (float) $commissionSetting->seller_percent);
            }

            $platformProfit = round($sellerGrossSales * ($platformPercent / 100), 2);
            $sellerNetProfit = round($sellerGrossSales - $platformProfit, 2);

            $sellerApprovedWithdrawals = (float) DB::table('withdrawals as w')
                ->join('users as u', 'u.id', '=', 'w.user_id')
                ->where('u.role', 'seller')
                ->where('w.status', 'approved')
                ->sum('w.amount');

            $sellerPendingWithdrawals = (float) DB::table('withdrawals as w')
                ->join('users as u', 'u.id', '=', 'w.user_id')
                ->where('u.role', 'seller')
                ->where('w.status', 'pending')
                ->sum('w.amount');

            return [
                'users' => [
                    [
                        "title" => "Total Users",
                        "value" => (int) ($users->total_users ?? 0),
                        "icon" => "Users",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "Active Users",
                        "value" => (int) ($users->active_users ?? 0),
                        "icon" => "UserCheck",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "Unverified Users",
                        "value" => (int) ($users->unverified_users ?? 0),
                        "icon" => "Mail",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "Blocked Users",
                        "value" => (int) ($users->blocked_users ?? 0),
                        "icon" => "UserX",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF]",
                        "colorIcon" => "#008ECC",
                    ],
                ],
                'deposits' => [
                    [
                        "title" => "Total Deposits",
                        "value" => (int) ($deposits->total_deposits ?? 0),
                        "icon" => "Wallet",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Pending Deposits",
                        "value" => (int) ($deposits->pending_deposits ?? 0),
                        "icon" => "Clock",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "diposite Charged",
                        "value" => (float) ($deposits->charged_deposits ?? 0),
                        "icon" => "CheckCircle",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Rejected Deposits",
                        "value" => (int) ($deposits->rejected_deposits ?? 0),
                        "icon" => "XCircle",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                ],
                'withdrawals' => [
                    [
                        "title" => "Total Withdrawals",
                        "value" => ((float) ($withdrawals->total_withdrawals_amount ?? 0)) . "$",
                        "icon" => "CreditCard",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Pending Withdrawals",
                        "value" => (int) ($withdrawals->pending_withdrawals ?? 0),
                        "icon" => "Clock",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "withdrawalCharged",
                        "value" => ((float) ($withdrawals->charged_withdrawals_amount ?? 0)) . "$",
                        "icon" => "CheckCircle",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Rejected Withdrawals",
                        "value" => (int) ($withdrawals->rejected_withdrawals ?? 0),
                        "icon" => "XCircle",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                ],
                'global' => [
                    [
                        "title" => "Orders Today",
                        "value" => (int) ($globals->orders_today ?? 0),
                        "icon" => "ShoppingCart",
                        "borderColor" => "border-[#008ECC]",
                        "bgColor" => "bg-[#E6F6FF]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "Total Revenue",
                        "value" => ((float) ($globals->total_revenue ?? 0)) . "$",
                        "icon" => "DollarSign",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "Pending Products",
                        "value" => $pendingProducts,
                        "icon" => "Box",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
                        "colorIcon" => "#008ECC",
                    ],
                    [
                        "title" => "New Users Today",
                        "value" => $newUsersToday,
                        "icon" => "Users",
                        "borderColor" => "border-[#008ECC] border-[1px]",
                        "bgColor" => "bg-[#E6F6FF]",
                        "colorIcon" => "#008ECC",
                    ],
                ],
                'profits' => [
                    [
                        "title" => "Seller Gross Sales",
                        "value" => $sellerGrossSales . "$",
                        "icon" => "Wallet",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Platform Profit",
                        "value" => $platformProfit . "$",
                        "icon" => "DollarSign",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Seller Net Profit",
                        "value" => $sellerNetProfit . "$",
                        "icon" => "TrendingUp",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Pending Seller Withdrawals",
                        "value" => $sellerPendingWithdrawals . "$",
                        "icon" => "CreditCard",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Approved Seller Withdrawals",
                        "value" => $sellerApprovedWithdrawals . "$",
                        "icon" => "CheckCircle",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                    [
                        "title" => "Platform Commission Rate",
                        "value" => $platformPercent . "%",
                        "icon" => "Percent",
                        "iconColor" => "#008ECC",
                        "bgColor" => "bg-[#E6F6FF]",
                    ],
                ],
            ];
        });

        return response()->json($payload);
    }

     public function getAnnalyseUser(){
        $AllUsers = User::where('role', "!=", 'admin')->count();
        $ActiveUsers = User::where('role', "!=", 'admin')->where('status', 'active')->count();
        $UnverifiedUsers = User::where('role', "!=", 'admin')->where('email_verified_at', null)->count();
        $BlockedUsers = User::where('role', "!=", 'admin')->whereIn('status', ['inactive', 'blocked'])->count();

        return response()->json([
          [
            "title" => "Total Users",
            "value" => $AllUsers,
            "icon" => "Users",
            "borderColor" => "border-[#008ECC] border-[1px]",
            "bgColor" => "bg-[#E6F6FF]",
            "colorIcon" => "#008ECC",
          ],
           [
            "title" => "Active Users",
            "value" => $ActiveUsers,
            "icon" => "UserCheck",
            "borderColor" => "border-[#008ECC] border-[1px]",
            "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
            "colorIcon" => "#008ECC",
           

           ],
            [
            "title" => "Unverified Users",
            "value" => $UnverifiedUsers,
            "icon" => "Mail",
            "borderColor" => "border-[#008ECC] border-[1px]",
            "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
            "colorIcon" => "#008ECC",
           
            ],
             [
            "title" => "Blocked Users",
            "value" => $BlockedUsers,
            "icon" => "UserX",
            "borderColor" => "border-[#008ECC] border-[1px]",
            "bgColor" => "bg-[#E6F6FF] ",
            "colorIcon" => "#008ECC",
          
           
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
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",

                 ],
        [
            "title" => "Pending Deposits",
            "value" => $PendingDeposits,
            "icon" => "Clock",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
        [
            "title" => "diposite Charged",
            "value" => $chargedDeposits,
            "icon" => "CheckCircle",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
        [
            "title" => "Rejected Deposits",
            "value" => $RejectedDeposits,
            "icon" => "XCircle",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
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
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
        [
            "title" => "Pending Withdrawals",
            "value" => $PendingWithdrawals,
            "icon" => "Clock",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
        [
            "title" => "withdrawalCharged",
            "value" => $withdrawlsCharged."$",
            "icon" => "CheckCircle",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
        [
            "title" => "Rejected Withdrawals",
            "value" => $RejectedWithdrawals,
            "icon" => "XCircle",
            "iconColor" => "#008ECC",
            "bgColor" => "bg-[#E6F6FF]",
        ],
    ]);
}
 public function getViewsGlobal(){
   $orderToday = Order::whereDate('created_at', now())->count();
   $chiffreDaffaires=Order::where('status', 'completed')->sum('total_price');
   $productsPending=Product::where('status', 'pending')->count();
   $newUserToday=User::where('role', "!=", 'admin')->whereDate('created_at', now())->count();

   return response()->json([
       [
           "title" => "Orders Today",
           "value" => $orderToday,
           "icon" => "ShoppingCart",
           "borderColor" => "border-[#008ECC]",
           "bgColor" => "bg-[#E6F6FF]",
           "colorIcon" => "#008ECC",
       ],
       [
           "title" => "Total Revenue",
           "value" => $chiffreDaffaires."$",
           "icon" => "DollarSign",
           "borderColor" => "border-[#008ECC] border-[1px]",
           "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
           "colorIcon" => "#008ECC",
       ],
       [
           "title" => "Pending Products",
           "value" => $productsPending,
           "icon" => "Box",
           "borderColor" => "border-[#008ECC] border-[1px]",
           "bgColor" => "bg-[#E6F6FF] text-[#008ECC]",
           "colorIcon" => "#008ECC",
       ],
       [
           "title" => "New Users Today",
           "value" => $newUserToday,
           "icon" => "Users",
           "borderColor" => "border-[#008ECC] border-[1px]",
           "bgColor" => "bg-[#E6F6FF]",
           "colorIcon" => "#008ECC",
       ],
   ]);
    }
public function getDepositWithdrawChartData(){
    $data = Cache::remember('dashboard:deposit-withdraw-chart:v1', 30, function () {
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

        return array_values($data);
    });

    return response()->json($data);
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


