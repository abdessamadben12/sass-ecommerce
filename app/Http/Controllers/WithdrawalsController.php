<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use App\Models\Withdrawal;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
                    

class WithdrawalsController extends Controller
{
      public function getWithdrawals(Request $request)
    {
        $status= $request->status;
        $startDate =$request->input('start_date')!==null ? Carbon::parse($request->input('start_date'))->startOfDay() : null;
        $endDate = $request->input('end_date')!==null ? Carbon::parse($request->input('end_date'))->endOfDay() : null;
        $trxOrName = $request->input('search', null);
        $perPage = $request->input('per_page', 10);
        $query = Withdrawal::query();
        if ($trxOrName !== null ) {
            $query->whereHas('user', function ($q) use ($trxOrName) {
                $q->where('name', 'like', '%' . $trxOrName . '%');
            })->orWhere('transaction_id', 'like', '%' . $trxOrName . '%'); 
          $query->whereHas('user', function ($q) use ($trxOrName) {
                $q->where('name', 'like', '%' . $trxOrName . '%');
            })->orWhere('transaction_id', 'like', '%' . $trxOrName . '%');
        
        }
        if($startDate !== null && $endDate !== null) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        } elseif ($startDate !== null) {
            $query->where('created_at', '>=', $startDate);
        } elseif ($endDate !== null) {
            $query->where('created_at', '<=', $endDate);
        }
        if($status === 'pending') {
            $query->whereNull('confirmed_at');
        } elseif ($status === 'confirmed') {
            $query->whereNotNull('confirmed_at');
        } elseif ($status === 'rejected') {
            $query->where('status', 'rejected');
        }
        $withdrawals= $query->with(['user',"transactions"])->paginate($perPage);

        return response()->json($withdrawals, 200);
    }
    
}
