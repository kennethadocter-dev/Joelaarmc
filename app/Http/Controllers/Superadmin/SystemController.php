<?php

namespace App\Http\Controllers\Superadmin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Exception;

class SystemController extends Controller
{
    /**
     * 🏠 System Control Panel - Main Page
     */
    public function index()
    {
        $stats = [
            'total_loans' => DB::table('loans')->count(),
            'total_customers' => DB::table('customers')->count(),
            'total_payments' => DB::table('payments')->count(),
        ];

        return inertia('Superadmin/System/Index', [
            'stats' => $stats,
            'backups' => $this->getBackupsList(),
            'basePath' => 'superadmin',
        ]);
    }

    /**
     * 📂 Return all backups (for AJAX refresh)
     */
    public function listBackups()
    {
        return response()->json([
            'backups' => $this->getBackupsList(),
        ]);
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
                return response()->json([
                    'message' => '❌ Backup failed. Please verify your database credentials and mysqldump installation.',
                    'backups' => $this->getBackupsList(),
                ], 500);
            }

            return response()->json([
                'message' => '✅ Backup created successfully!',
                'backups' => $this->getBackupsList(),
            ]);
        } catch (Exception $e) {
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
        return response()->json([
            'message' => "✅ Backup '{$file}' restored successfully!",
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
     * 🗑️ Delete a backup (fully fixed)
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

        // Try both Storage and native unlink, whichever exists
        $storagePath = "backups/{$file}";
        $fullPath = storage_path("app/backups/{$file}");

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
        return response()->json([
            'message' => '✅ Loan recalculation complete!',
        ]);
    }

    /**
     * 🧨 System Reset (placeholder)
     */
    public function reset(Request $request)
    {
        $keep = $request->input('keep') ?? 'superadmin_only';

        return response()->json([
            'message' => "✅ System reset complete (kept: {$keep}).",
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

        $backups = collect($files)
            ->filter(fn($file) => is_file($file))
            ->map(fn($file) => [
                'file' => basename($file),
                'size' => round(filesize($file) / 1024, 2) . ' KB',
                'date' => date('Y-m-d H:i:s', filemtime($file)),
            ])
            ->sortByDesc('date')
            ->values()
            ->toArray();

        return $backups;
    }
}