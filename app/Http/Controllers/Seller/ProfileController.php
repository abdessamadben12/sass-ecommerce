<?php

namespace App\Http\Controllers\Seller;

use App\Http\Controllers\Controller;
use App\Models\Shop;
use App\Models\User_detaill;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\View\View;

class ProfileController extends Controller
{
    public function index(): View
    {
        $user = auth()->user();
        $details = $user->details ?? new User_detaill();
        $shop = $user->shops()->first();

        return view('seller.profile.index', compact('user', 'details', 'shop'));
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'phone' => 'nullable|string|max:20',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'zip' => 'nullable|string|max:20',
            'country' => 'nullable|string|max:100',
            'image' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();

        $data = $request->only(['first_name', 'last_name', 'phone', 'address', 'city', 'state', 'zip', 'country']);

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('profiles/' . $user->id, 'spaces_2');
        }

        User_detaill::updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return back()->with('success', 'Profil mis a jour.');
    }

    public function shop(): View
    {
        $user = auth()->user();
        $shop = $user->shops()->first();

        return view('seller.profile.shop', compact('shop'));
    }

    public function updateShop(Request $request): RedirectResponse
    {
        $request->validate([
            'shop_name' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'logo' => 'nullable|image|max:2048',
        ]);

        $user = auth()->user();
        $shop = $user->shops()->first();

        $data = [
            'shop_name' => $request->shop_name,
            'shop_slug' => Str::slug($request->shop_name),
            'description' => $request->description,
        ];

        if ($request->hasFile('logo')) {
            $data['logo'] = $request->file('logo')->store('shops/' . ($shop->id ?? 'new'), 'spaces_2');
        }

        if ($shop) {
            $shop->update($data);
        } else {
            $data['user_id'] = $user->id;
            $data['status'] = 'active';
            Shop::create($data);
        }

        return back()->with('success', 'Boutique mise a jour.');
    }
}
