<x-app-layout>
    <x-slot name="header">
        <h2 class="font-semibold text-xl">Create New Team</h2>
    </x-slot>

    <form method="POST" action="{{ route('teams.store') }}">
        @csrf
        <div class="mb-4">
            <label>Team Name</label>
            <input type="text" name="name" class="border p-2 w-full" required>
        </div>
        <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded">
            Create Team
        </button>
    </form>
</x-app-layout>