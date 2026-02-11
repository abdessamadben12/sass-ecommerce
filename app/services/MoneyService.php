<?php
namespace App\Services;

use App\Models\User;
use App\Models\Wallet;
use App\Models\Transaction;
use App\Models\Withdrawal;
use Illuminate\Support\Str;

class MoneyService

{
public function addBalance(User $user, float $amount, string $remark = "Balance added", $sourceable = null)
{
    $wallet = $user->balance ?? Wallet::create([
        'user_id' => $user->id,
        'balance' => 0
    ]);

    if ($amount !== 0.0) {
        $wallet->increment('balance', $amount);
    }
    $this->createTransaction(
        $user->id,
        $amount,
        '+',
        $remark,
        $wallet->balance,
        $sourceable
    );

    return true;
}
private function createTransaction(
    int $userId,
    float $amount,
    string $type,
    string $remark,
    float $postBalance,
    $sourceable = null // Peut être Order, Withdrawal, Deposit...
) {
    $transaction = new Transaction();

    $transaction->user_id      = $userId;
    $transaction->amount       = $amount;
    $transaction->trx_type     = $type; // '+' ou '-'
    $transaction->remark      = $remark;
    $transaction->trx          = strtoupper(Str::random(10));
    $transaction->post_balance = $postBalance;
    $transaction->charge       = 0;
    $transaction->status       = 'success';

    if ($sourceable) {
        $transaction->sourceable_type = get_class($sourceable);
        $transaction->sourceable_id   = $sourceable->id;
    }

    $transaction->save();

    if ($sourceable instanceof Withdrawal && empty($sourceable->transaction_id)) {
        $sourceable->transaction_id = $transaction->trx;
        $sourceable->save();
    }
}






}














//  public function addBalance(User $user, float $amount, string $details = "Balance added")
//     {
//         $wallet = $user->balance ?? Wallet::create(['user_id' => $user->id, 'balance' => 0]);

//         $wallet->increment('balance', $amount);

//         $this->createTransaction($user->id, $amount, '+', $details, $wallet->balance);

//         return true;
//     }

//     public function withdraw(User $user, float $amount, string $details = "Withdrawal request")
//     {
//         $wallet = $user->balance;

//         if (!$wallet || $wallet->balance < $amount) {
//             throw new \Exception("رصيد غير كافٍ");
//         }

//         $wallet->decrement('balance', $amount);

//         Withdrawal::create([
//             'user_id' => $user->id,
//             'amount' => $amount,
//             'trx' => strtoupper(Str::random(10)),
//             'status' => 'pending',
//         ]);

//         $this->createTransaction($user->id, $amount, '-', $details, $wallet->balance);

//         return true;
//     }

    // public function createTransaction($userId, $amount, $type, $details, $postBalance)
    // {
    //     Transaction::create([
    //         'user_id' => $userId,
    //         'amount' => $amount,
    //         'trx_type' => $type,
    //         'details' => $details,
    //         'trx' => strtoupper(Str::random(10)),
    //         'post_balance' => $postBalance,
    //     ]);
    // }

    // public function applyCommission(User $seller, float $amount, float $percent, string $details = 'Platform commission')
    // {
    //     $commission = $amount * $percent;
    //     $this->withdraw($seller, $commission, $details);
    // }

    // public function applyReferral(User $referrer, float $amount, float $percent, string $details = 'Referral commission')
    // {
    //     $commission = $amount * $percent;
    //     $this->addBalance($referrer, $commission, $details);
    // }
