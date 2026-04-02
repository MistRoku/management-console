<!DOCTYPE html>
<html>
<head>
    <title>AdminForge - SaaS Dashboard</title>
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    @livewireStyles
</head>
<body class="bg-gray-100">
    <nav class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4">
            <div class="flex justify-between h-16">
                <div class="flex items-center">
                    <h1 class="text-xl font-bold">AdminForge</h1>
                </div>
                <div class="flex items-center space-x-4">
                    <livewire:team-switcher />
                    <a href="{{ route('billing.index') }}">Billing</a>
                    <a href="{{ route('analytics.dashboard') }}">Analytics</a>
                    <x-dropdown-link :href="route('profile.edit')">Profile</x-dropdown-link>
                    <x-dropdown-link :href="route('logout')" method="post">Log Out</x-dropdown-link>
                </div>
            </div>
        </div>
    </nav>

    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        @if (session('success'))
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {{ session('success') }}
            </div>
        @endif
        {{ $slot }}
    </main>

    @livewireScripts
    @stack('scripts')
</body>
</html>
