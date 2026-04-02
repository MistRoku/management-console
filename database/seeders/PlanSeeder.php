<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Plan;

class PlanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Plan::create([
        'name' => 'Starter',
        'stripe_price' => 'price_123456789', // Get from Stripe dashboard
        'price' => 19.00,
        'max_users' => 5,
        'max_storage_gb' => 10,
        'features' => ['Basic analytics', '5 team members']
    ]);
    }
}
