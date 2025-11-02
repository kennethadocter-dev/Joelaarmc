<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- ✅ CSRF Token — prevents 419 errors --}}
        <meta name="csrf-token" content="{{ csrf_token() }}">

        <title inertia>{{ config('app.name', 'Joelaar Micro-Credit') }}</title>

        {{-- ✅ Favicon --}}
        <link rel="icon" type="image/png" href="{{ asset('images/logo.png') }}">
        {{-- Optional fallback --}}
        <link rel="shortcut icon" href="{{ asset('favicon.ico') }}" type="image/x-icon">

        {{-- ✅ Fonts --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        {{-- ✅ Vite / Inertia / Routes --}}
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.jsx'])
        @inertiaHead

        {{-- ✅ NProgress Styles (for smoother page transitions) --}}
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/nprogress/0.2.0/nprogress.min.css" integrity="sha512-bQvYbtQmXr1E4Y2LsnWZ1KoyK1+4c2IOfkaKxFoZXkR5cD1K8ExJX4B7zUZyL4+ZAI2ZT7Xz1P+a3sGSOgFjqA==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    </head>
    <body class="font-sans antialiased bg-gray-50 text-gray-900">
        @inertia
    </body>
</html>