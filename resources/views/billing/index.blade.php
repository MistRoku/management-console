<x-app-layout>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @foreach ($plans as $plan)
            <div class="border p-6 rounded-lg">
                <h3 class="text-2xl">${{ $plan->price }}/mo</h3>
                <h2>{{ $plan->name }}</h2>
                <ul>
                    @foreach ($plan->features as $feature)
                        <li>{{ $feature }}</li>
                    @endforeach
                </ul>
                <form method="POST" action="{{ route('billing.subscribe') }}">
                    @csrf
                    <input type="hidden" name="stripe_price_id" value="{{ $plan->stripe_price }}">
                    <button type="submit" class="w-full bg-green-500 text-white p-3 mt-4">
                        Start {{ $plan->name }} Trial
                    </button>
                </form>
            </div>
        @endforeach
    </div>
</x-app-layout>
