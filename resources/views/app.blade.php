<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- ✅ CSRF Token (prevents 419 errors) --}}
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Joelaar Micro-Credit') }}</title>

        {{-- ✅ Favicon --}}
        <link rel="icon" type="image/png" href="{{ asset('images/logo.png') }}">
        <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">

        {{-- ✅ Fonts --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- ✅ Vite / Inertia Integration --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        {{-- ⚡ Removed external NProgress CDN (now loaded locally via import in AuthenticatedLayout.jsx) --}}
    </head>

    <body class="font-sans antialiased bg-gray-50 text-gray-900">
        @inertia
    </body>
</html>