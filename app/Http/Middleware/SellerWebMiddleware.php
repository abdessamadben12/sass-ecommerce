<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SellerWebMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return redirect()->route('login.seller');
        }

        if (($user->role ?? null) !== 'seller') {
            abort(403, 'Acces reserve aux vendeurs.');
        }

        return $next($request);
    }
}

