<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Plan;

class BillingController extends Controller
{
    public function index()
    {
        $team = auth()->guard()->user()->currentTeam;
        $subscription = $team->subscription;
        $plans = Plan::all();
        return view('billing.index', compact('team', 'subscription', 'plans'));
    }

    public function createSubscription(Request $request)
    {
        $team = auth()->guard()->user()->currentTeam;

        $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
        $customer = $stripe->customers->create([
            'name' => $team->name,
            'email' => auth()->guard()->user()->email,
        ]);

        $team->update([
            'stripe_id' => $customer->id,
        ]);

        $session = $stripe->checkout->sessions->create([
            'customer' => $customer->id,
            'mode' => 'subscription',
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price' => $request->plan_id,
                'quantity' => 1,
            ]],
            'success_url' => route('billing.success'),
            'cancel_url' => route('billing.index'),
        ]);

        return redirect($session->url);
    }
}
