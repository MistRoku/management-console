<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class SetCurrentTeams
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (Auth::check()) {
            $teamId = session('current_team') ?? auth()->guard()->user()->ownedTeams()->first()?->id;
            session(['current_team' => $teamId]);
        }
        return $next($request);
    }


}
