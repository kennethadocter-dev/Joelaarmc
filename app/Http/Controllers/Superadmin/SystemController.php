<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Exception;

class SystemController extends Controller
{
    public function __construct()
    {
        // 🔒 Extra safety: only superadmin should access system control
        $this->middleware(function ($request, $next) {
            $user = auth()->user();

            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmin can access System Control.');
            }

            return $next($request);
        });
    }

    /**
     * 🏠 System Control Panel - Main Page
     */
    public function index()
    {
        try {
            $stats = [
                'total_loans'     => DB::table('loans')->count(),
                'total_customers' => DB::table('customers')->count(),
                'total_payments'  => DB::table('payments')->count(),
            ];

            $backups = $this->getBackupsList();
        } catch (\Throwable $e) {
            // If anything (DB/filesystem) fails, log it but still show the page
            Log::error('❌ SystemController@index error', [
                'error' => $e->getMessage(),
            ]);

            $stats = [
                'total_loans'     => 0,
                'total_customers' => 0,
                'total_payments'  => 0,
            ];

            $backups = [];
        }

        return inertia('Superadmin/System/Index', [
            'stats'    => $stats,
            'backups'  => $backups,
            'basePath' => 'superadmin',
        ]);
    }

    /**
     * 📂 Return all backups (for AJAX refresh)
     */
    public function listBackups()
    {
        try {
            return response()->json([
                'backups' => $this->getBackupsList(),
            ]);
        } catch (\Throwable $e) {
            Log::error('❌ SystemController@listBackups error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => '❌ Failed to load backups.',
                'backups' => [],
            ], 500);
        }
    }

    /**
     * 💾 Create a new database backup (.sql dump)
     */
    public function backup()
    {
        try {
            $backupPath = storage_path('app/backups');
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0775, true);
            }

            $db = config('database.connections.mysql');
            $filename = 'backup_' . now()->format('Y-m-d_H-i-s') . '.sql';
            $fullPath = $backupPath . '/' . $filename;

            $command = sprintf(
                'mysqldump --user=%s --password=%s --host=%s %s > %s',
                escapeshellarg($db['username']),
                escapeshellarg($db['password']),
                escapeshellarg($db['host']),
                escapeshellarg($db['database']),
                escapeshellarg($fullPath)
            );

            exec($command, $output, $resultCode);

            if ($resultCode !== 0) {
                Log::error('❌ Backup failed', [
                    'code'   => $resultCode,
                    'output' => $output,
                ]);

                return response()->json([
                    'message' => '❌ Backup failed. Please verify database credentials and mysqldump installation.',
                    'backups' => $this->getBackupsList(),
                ], 500);
            }

            return response()->json([
                'message' => '✅ Backup created successfully!',
                'backups' => $this->getBackupsList(),
            ]);
        } catch (Exception $e) {
            Log::error('❌ SystemController@backup error', [
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => '❌ Error during backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * ♻️ Restore a backup (placeholder)
     */
    public function restore(Request $request)
    {
        $file = $request->input('file');

        // NOTE: this is still a placeholder — not actually running SQL import.
        return response()->json([
            'message' => "✅ Backup '{$file}' restored successfully! (placeholder)",
        ]);
    }

    /**
     * 📤 Upload backup manually
     */
    public function upload(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|file',
        ]);

        $uploadedFile = $request->file('backup_file');
        $uploadedFile->storeAs('backups', $uploadedFile->getClientOriginalName());

        return response()->json([
            'message' => '✅ Backup uploaded successfully!',
            'backups' => $this->getBackupsList(),
        ]);
    }

    /**
     * 🗑️ Delete a backup
     */
    public function deleteBackup(Request $request)
    {
        $file = $request->input('file');

        if (!$file) {
            return response()->json([
                'message' => '⚠️ No file name provided.',
                'backups' => $this->getBackupsList(),
            ], 400);
        }

        $storagePath = "backups/{$file}";
        $fullPath    = storage_path("app/backups/{$file}");

        if (Storage::disk('local')->exists($storagePath)) {
            Storage::disk('local')->delete($storagePath);
        } elseif (file_exists($fullPath)) {
            unlink($fullPath);
        } else {
            return response()->json([
                'message' => "⚠️ File '{$file}' not found on disk.",
                'backups' => $this->getBackupsList(),
            ], 404);
        }

        return response()->json([
            'message' => "🗑️ Backup '{$file}' deleted successfully!",
            'backups' => $this->getBackupsList(),
        ]);
    }

    /**
     * 🔁 Recalculate all loans (placeholder)
     */
    public function recalculateLoans()
    {
        // Hook in your real logic later
        return response()->json([
            'message' => '✅ Loan recalculation complete! (placeholder)',
        ]);
    }

    /**
     * 🧨 System Reset (placeholder)
     */
    public function reset(Request $request)
    {
        $keep = $request->input('keep') ?? 'superadmin_only';

        // Hook in your real logic later
        return response()->json([
            'message' => "✅ System reset complete (kept: {$keep}). (placeholder)",
        ]);
    }

    /**
     * 🧾 Helper: Get clean formatted backup list (direct file scan)
     */
    private function getBackupsList(): array
    {
        $backupPath = storage_path('app/backups');

        if (!file_exists($backupPath)) {
            return [];
        }

        $files = glob($backupPath . '/*');
        if (!$files) {
            return [];
        }

        return collect($files)
            ->filter(fn ($file) => is_file($file))
            ->map(fn ($file) => [
                'file' => basename($file),
                'size' => round(filesize($file) / 1024, 2) . ' KB',
                'date' => date('Y-m-d H:i:s', filemtime($file)),
            ])
            ->sortByDesc('date')
            ->values()
            ->toArray();
    }
}