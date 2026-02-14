<?php

namespace App\Http\Controllers;

use Exception;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Http\Request;
use App\Services\MoneyService;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Http\Requests\UpdateUserRequest;

class UserController extends Controller
{
    public function createAdmin(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:120',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|max:255',
        ]);

        $user = DB::transaction(function () use ($data) {
            $newAdmin = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => 'admin',
                'status' => 'active',
                'email_verified_at' => now(),
            ]);

            Wallet::firstOrCreate(
                ['user_id' => $newAdmin->id],
                ['balance' => 0]
            );

            return $newAdmin;
        });

        return response()->json([
            'message' => 'Admin account created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ], 201);
    }

    public function getActiveUsers(Request $request)
    {
    $perPage = $request->input('per_page', 10);
    $role = $request->input('role');
    $name = $request->input('name');
    $query = User::query();
    if(!empty($role) && $role !== 'null' && $role !== 'undefined'){
          $query->where('role', $role);
    }
    if(!empty($name) && $name !== 'null' && $name !== 'undefined'){
         $query->where(function ($q) use ($name) {
            $q->where('name', 'like', "%$name%")
              ->orWhere('email', 'like', "%$name%");
        });
    }
   $users = $query->with(["balance", "orders", "shops.products"])
     ->withSum("orders","total_price")
     ->where('status', 'active')->paginate($perPage);
        return response()->json([
            'data' => $users
        ], 200); 
        }
    public function getBlockedUsers(Request $request){
         $perPage = $request->input('per_page', 10);
     $role = $request->input('role');
    $name = $request->input('name');
    $query = User::query();
    if(!empty($role) && $role !== 'null' && $role !== 'undefined'){
          $query->where('role', $role);
    }
    if(!empty($name) && $name !== 'null' && $name !== 'undefined'){
         $query->where(function ($q) use ($name) {
            $q->where('name', 'like', "%$name%")
              ->orWhere('email', 'like', "%$name%");
        });
    }
   
   $users = $query->with(["balance", "orders", "shops.products"])
     ->withSum("orders","total_price")
        ->where('status', 'inactive')->paginate($perPage);
        return response()->json([
            'data' => $users
        ], 200); 
       
     } 
        
    public function getUnverifiedUsers (Request $request){
    $perPage = $request->input('per_page', 10);
     $role = $request->input('role');
    $name = $request->input('name');
    $query = User::query();
    if(!empty($role) && $role !== 'null' && $role !== 'undefined'){
          $query->where('role', $role);
    }
    if(!empty($name) && $name !== 'null' && $name !== 'undefined'){
         $query->where(function ($q) use ($name) {
            $q->where('name', 'like', "%$name%")
              ->orWhere('email', 'like', "%$name%");
        });
    }
   
   $users = $query->with(["balance", "orders", "shops.products"])
     ->withSum("orders","total_price")
   ->where('status', 'pending')->paginate($perPage);
        return response()->json([
            'data' => $users
        ], 200); 
    } 
    public function getUser(Request $request){
        $id = $request->id;
        $user = User::findOrFail($id);
        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }
        if($user->role=="seller"){
            $user = User::with(["balance", "orders","withdrawals","deposits","details"])
                ->withCount("orders")
                ->withSum("withdrawals","amount")
                ->withSum("deposits","amount")
                ->withSum("transactions","amount")  
                ->withSum("profit","total_amount")
                ->find($id);
            return response()->json(["user"=>new UserResource($user)], 200);
        }
        $user = User::with(["balance", "orders", "shops.products","withdrawals","deposits","transactions","profit","details"])
            ->withCount('products')
            ->withCount("orders")
            ->withSum("withdrawals","amount")
            ->withSum("deposits","amount")
            ->withSum("transactions","amount")  
            ->withSum("profit","total_amount")
            ->find($id);
       $totalShopProfit = $user->profit->sum('total_amount');
        $totalDueAmount = $user->shops
                ->flatMap->profits
        ->where('is_paid', false)
    ->sum(function ($profit) {
        return $profit->total_amount - $profit->profit_platform;
    });
        return response()->json(["user"=>new UserResource($user), "total_profit"=>$totalShopProfit,"due_amount"=>$totalDueAmount], 200); 
    }
    public function deleteUser(Request $request){
        try{
        $id = $request->id;
        $user=User::find($id);
        if(!$user){
            return response()->json(false, 404);
        }
       if($user->balance()->exists() ){
        $user->balance()->delete();
       }
        if ($user->orders()->exists()) {
        $user->orders()->delete();
}
       if( $user->shops()->exists()){
           $user->shops()->delete();
       }
        if($user->deposits()->exists()){
            $user->deposits()->delete();
        }
        if($user->notifications()->exists()){
            $user->notifications()->delete();
        }
        if($user->withdrawals()->exists()){
            $user->withdrawals()->delete();
        }
        $user->delete();
        return response()->json(true, 200); 
        }
        catch(Exception $e){
            return response()->json($e->getMessage(), 400);
        }
    }
 public function addBalance(Request $request, MoneyService $moneyService)
{
    $request->validate([
        'amount' => 'required|numeric|min:0.01',
        'remark' => 'nullable|string'
    ]);
    $remark = $request->filled('remark')
        ? (is_array($request->remark) ? implode(', ', $request->remark) : $request->remark)
        : 'Balance added';

    $balance = floatval($request->amount);
    $user = User::findOrFail($request->id);
    try {
        $moneyService->addBalance($user, $balance, $remark);
        return response()->json(["message" => "Balance updated successfully to the user's account"], 200);
    } catch (\Exception $e) {
        return response()->json(["error" => $e->getMessage()], 400);
    }
}

     
public function subBalance(Request $request)
{
    $request->validate([
        'amount' => 'required|numeric|min:1',
        'id' => 'required|exists:users,id',
    ]);

    $amount = $request->amount;

    try {
        DB::transaction(function () use ($request, $amount) {

            $user = User::find($request->id);

            // Verrouillage du wallet
            $wallet = $user->balance()->lockForUpdate()->first();

            if (!$wallet || $wallet->balance < $amount) {
                abort(400, 'Solde insuffisant pour effectuer cette operation.');
            }

            // Soustraction sécurisée
            $wallet->decrement('balance', $amount);
        });

        return response()->json([
            'message' => 'Operation effectuee avec succes.'
        ], 200);

    } catch (\Exception $e) {
        return response()->json([
            'message' => $e->getMessage()
        ], 400);
    }
}
  public function updateUser(UpdateUserRequest $request, $id){
    $user = User::findOrFail($id);

    // Update main user fields
    $user->email = $request->input('email', $user->email);
    $user->email_verified_at = $request->boolean('verified_email') ? now() : null;
    $user->is_2fa_enabled = $request->boolean('twoFA');
    if ($request->filled('status')) {
        $user->status = $request->input('status');
    }
    $user->save();
    // Update or create details
    $user->details()->updateOrCreate(
        ['user_id' => $user->id],
        [
            'first_name' => $request->first_name,
            'last_name'  => $request->last_name,
            'phone'     => $request->mobile,
            'address'    => $request->address,
            'city'       => $request->city,
            'state'      => $request->state,
            'zip'   => $request->zipCode,
            'country'    => $request->country,
        ]
    );

    return response()->json([
        'message' => 'User updated successfully',
        "2fa"=>$request->twoFA,
        "email-verified"=>$request->boolean('verified_email'),
        // 'user'    => $user->fresh(['details']),
    ]);
}

}

