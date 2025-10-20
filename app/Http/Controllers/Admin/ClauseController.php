<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;  // ✅ ADD THIS LINE
use App\Models\Clause;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ClauseController extends Controller
{
    public function index()
    {
        $clauses = Clause::latest()->get();
        return Inertia::render('Clauses/Index', [
            'clauses' => $clauses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        Clause::create($request->only('title', 'body'));

        return back()->with('success', 'Clause added successfully ✅');
    }

    public function update(Request $request, Clause $clause)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        $clause->update($request->only('title', 'body'));

        return back()->with('success', 'Clause updated successfully ✅');
    }

    public function destroy(Clause $clause)
    {
        $clause->delete();
        return back()->with('success', 'Clause deleted successfully 🗑️');
    }
}