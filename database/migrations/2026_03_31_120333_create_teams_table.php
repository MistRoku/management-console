<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
        $table->id();
        $table->string('name');                    // "Acme Corp"
        $table->string('slug')->unique();          // "acme-corp"
        $table->string('stripe_id')->nullable()->unique();  // Stripe customer ID
        $table->string('stripe_status')->nullable();        // "active", "trialing"
        $table->string('stripe_subscription')->nullable();
        $table->timestamp('trial_ends_at')->nullable();     // 14-day trial
        $table->timestamps();
    });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
