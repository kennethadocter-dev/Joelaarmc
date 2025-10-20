<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class SystemController extends Controller
{
    /** 🔧 Role-based path helper */
    private function basePath()
    {
        $u = auth()->user();
        return ($u && ($u->is_super_admin || $u->role === 'superadmin'))
            ? 'superadmin'
            : 'admin';
    }

    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = auth()->user();
            if (!$user || !in_array($user->role, ['admin', 'superadmin', 'superuser'])) {
                abort(403, 'Access denied.');
            }
            return $next($request);
        });
    }

    /** ⚙️ System Control Dashboard */
    public function index()
    {
        $stats = [
            'users'       => DB::table('users')->count(),
            'customers'   => DB::table('customers')->count(),
            'loans'       => DB::table('loans')->count(),
            'payments'    => DB::table('payments')->count(),
            'last_backup' => $this->getLastBackupTime(),
        ];

        return Inertia::render('Admin/System/Index', [
            'auth' => ['user' => auth()->user()],
            'stats' => $stats,
            'basePath' => $this->basePath(),
            'backups' => $this->getAllBackups(),
        ]);
    }

    /** 🕒 Get timestamp of latest backup */
    private function getLastBackupTime()
    {
        $backupPath = storage_path('app/backups');
        $latest = collect(glob("$backupPath/*"))
            ->filter(fn($f) => str_ends_with($f, '.sqlite') || str_ends_with($f, '.sql'))
            ->sortByDesc(fn($f) => filemtime($f))
            ->first();

        return $latest
            ? Carbon::createFromTimestamp(filemtime($latest))->diffForHumans()
            : 'No backups yet';
    }

    /** 📦 Helper: Get all backups directly from /storage/app/backups */
    private function getAllBackups()
    {
        $backupPath = storage_path('app/backups');

        return collect(glob("$backupPath/*"))
            ->filter(fn($f) => str_ends_with($f, '.sqlite') || str_ends_with($f, '.sql'))
            ->sortByDesc(fn($f) => filemtime($f))
            ->map(fn($f) => [
                'file' => basename($f),
                'size' => round(filesize($f) / 1024, 1) . ' KB',
                'date' => Carbon::createFromTimestamp(filemtime($f))->toDateTimeString(),
            ])
            ->values()
            ->toArray();
    }

    /**
     * 💾 Create new backup (SQLite & MySQL supported — instant frontend refresh)
     */
    public function backupData(Request $request)
    {
        \Log::info("⚡ backupData() route triggered by " . (auth()->user()->email ?? 'guest'));

        try {
            $backupDir = storage_path('app/backups');
            if (!file_exists($backupDir)) {
                mkdir($backupDir, 0755, true);
                \Log::info("📁 Backup directory created: {$backupDir}");
            }

            $timestamp = now()->format('Y-m-d_H-i-s');
            $connection = config('database.default');
            $backupFile = "{$backupDir}/backup-{$timestamp}." . ($connection === 'sqlite' ? 'sqlite' : 'sql');

            if ($connection === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                if (!file_exists($dbPath)) throw new \Exception('SQLite database file not found.');
                copy($dbPath, $backupFile);
            } else {
                $dbConfig = config("database.connections.mysql");
                if (!$dbConfig) throw new \Exception('MySQL configuration missing.');

                $dbName = $dbConfig['database'];
                $tables = DB::select('SHOW TABLES');
                if (empty($tables)) throw new \Exception('No tables found in MySQL database.');
                $tableKey = array_keys((array)$tables[0])[0];

                $dump = "-- Laravel Auto Backup\n-- Database: {$dbName}\n-- Created: " . now() . "\n\nSET FOREIGN_KEY_CHECKS=0;\n\n";
                foreach ($tables as $tableObj) {
                    $table = $tableObj->$tableKey ?? null;
                    if (!$table) continue;
                    $create = DB::select("SHOW CREATE TABLE `$table`")[0]->{'Create Table'};
                    $dump .= "DROP TABLE IF EXISTS `$table`;\n$create;\n\n";

                    $rows = DB::table($table)->get();
                    if ($rows->isNotEmpty()) {
                        foreach ($rows as $row) {
                            $columns = array_map(fn($c) => "`$c`", array_keys((array)$row));
                            $values = array_map(fn($v) => is_null($v) ? 'NULL' : DB::getPdo()->quote($v), array_values((array)$row));
                            $dump .= "INSERT INTO `$table` (" . implode(',', $columns) . ") VALUES (" . implode(',', $values) . ");\n";
                        }
                        $dump .= "\n";
                    }
                }
                $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";
                file_put_contents($backupFile, $dump);
            }

            if (!file_exists($backupFile) || filesize($backupFile) === 0) {
                throw new \Exception('Backup file not created or empty.');
            }

            $this->cleanupOldBackups($backupDir);

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('System Backup', 'Database backup created by ' . auth()->user()->name . ' (' . basename($backupFile) . ')');
            }

            // ✅ Unified Response (JSON or Inertia)
            $files = $this->getAllBackups();

            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => '✅ Backup completed successfully.',
                    'backups' => $files,
                ]);
            }

            return Inertia::render('Admin/System/Index', [
                'auth' => ['user' => auth()->user()],
                'stats' => [
                    'users' => DB::table('users')->count(),
                    'customers' => DB::table('customers')->count(),
                    'loans' => DB::table('loans')->count(),
                    'payments' => DB::table('payments')->count(),
                    'last_backup' => $this->getLastBackupTime(),
                ],
                'basePath' => $this->basePath(),
                'backups' => $files,
            ])->with('success', '✅ Backup completed successfully.');

        } catch (\Throwable $e) {
            \Log::error('❌ Backup failed', ['error' => $e->getMessage()]);
            if ($request->expectsJson() || $request->wantsJson()) {
                return response()->json([
                    'success' => false,
                    'message' => '❌ Backup failed: ' . $e->getMessage(),
                ], 500);
            }
            return back()->with('error', '❌ Backup failed: ' . $e->getMessage());
        }
    }

    /** 🧹 Keep only latest 5 backups */
    private function cleanupOldBackups($dir)
    {
        $files = collect(glob("$dir/*"))
            ->sortByDesc(fn($f) => filemtime($f))
            ->skip(5);
        foreach ($files as $oldFile) {
            @unlink($oldFile);
        }
    }

    /** 📋 List all available backup files */
    public function listBackups()
    {
        return response()->json(['backups' => $this->getAllBackups()]);
    }

    /** 🗑️ Delete a specific backup file + log it */
    public function deleteBackup($file)
    {
        try {
            $path = storage_path("app/backups/{$file}");
            if (!file_exists($path)) return back()->with('error', '⚠️ Backup file not found.');
            unlink($path);

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('Delete Backup', "Backup file {$file} deleted by " . auth()->user()->name);
            }

            \Log::info("🗑️ Backup deleted: {$file} by " . auth()->user()->email);
            return back()->with('success', "🗑️ Backup {$file} deleted successfully.");
        } catch (\Throwable $e) {
            \Log::error('❌ Delete backup failed', ['error' => $e->getMessage()]);
            return back()->with('error', '❌ Failed to delete backup: ' . $e->getMessage());
        }
    }

    /** 🔄 Refresh backups list */
    public function refreshBackups()
    {
        try {
            return response()->json(['success' => true, 'backups' => $this->getAllBackups()]);
        } catch (\Throwable $e) {
            \Log::error('❌ Refresh backups failed', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => 'Failed to refresh backups.']);
        }
    }

    /** 📥 Download backup file */
    public function downloadBackup($file)
    {
        $path = storage_path("app/backups/{$file}");
        if (!file_exists($path)) return back()->with('error', '⚠️ Backup file not found.');
        return response()->download($path);
    }

    /** 🩹 Restore a selected backup file (via modal) */
    public function restoreData(Request $request)
    {
        try {
            $file = $request->input('file');
            if (!$file) throw new \Exception('No backup file selected.');

            $path = storage_path("app/backups/{$file}");
            if (!file_exists($path)) throw new \Exception('Selected backup file not found.');

            $connection = config('database.default');
            if ($connection === 'sqlite') {
                copy($path, database_path('database.sqlite'));
            } else {
                $db = config("database.connections.{$connection}");
                $command = sprintf(
                    'mysql -u%s -p%s %s < %s',
                    escapeshellarg($db['username']),
                    escapeshellarg($db['password']),
                    escapeshellarg($db['database']),
                    escapeshellarg($path)
                );
                shell_exec($command);
            }

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('System Restore', 'Database restored from ' . basename($file) . ' by ' . auth()->user()->name);
            }

            \Log::info("✅ Database restored by " . auth()->user()->email . " | File: " . basename($file));
            return back()->with('success', '✅ Database restored successfully from ' . basename($file));
        } catch (\Throwable $e) {
            \Log::error('❌ Restore failed', ['error' => $e->getMessage()]);
            return back()->with('error', '❌ Restore failed: ' . $e->getMessage());
        }
    }

    /** ♻️ Reset all system data */
    public function resetData(Request $request)
    {
        try {
            DB::beginTransaction();
            $superadmin = User::where('role', 'superadmin')->first();
            if (!$superadmin) throw new \Exception('No Superadmin found. Reset aborted.');
            $keepMode = $request->input('keep', 'superadmin_only');
            Schema::disableForeignKeyConstraints();

            $tables = ['customers', 'guarantors', 'loans', 'loan_schedules', 'payments', 'activity_logs', 'sms_logs'];
            foreach ($tables as $table) {
                if (Schema::hasTable($table)) {
                    DB::table($table)->truncate();
                    if (DB::getDriverName() !== 'sqlite') {
                        DB::statement("ALTER TABLE {$table} AUTO_INCREMENT = 1");
                    }
                }
            }

            $keepRoles = match ($keepMode) {
                'keep_all_staff' => ['superadmin', 'admin', 'staff'],
                'keep_admins' => ['superadmin', 'admin'],
                default => ['superadmin'],
            };

            User::whereNotIn('role', $keepRoles)->delete();
            Schema::enableForeignKeyConstraints();
            DB::commit();

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('System Reset', 'System data cleared by ' . auth()->user()->name . " | Mode: {$keepMode}");
            }

            return back()->with('success', "✅ All data cleared successfully. Mode: {$keepMode}");
        } catch (\Throwable $e) {
            DB::rollBack();
            \Log::error('❌ System reset failed', ['error' => $e->getMessage()]);
            return back()->with('error', '❌ Reset failed: ' . $e->getMessage());
        }
    }

    /** 🧠 Preview data before reset */
    public function previewReset()
    {
        try {
            $stats = [
                'customers' => DB::table('customers')->count(),
                'loans' => DB::table('loans')->count(),
                'payments' => DB::table('payments')->count(),
                'users' => DB::table('users')->count(),
            ];
            return response()->json(['success' => true, 'message' => '✅ Data preview loaded successfully.', 'stats' => $stats]);
        } catch (\Throwable $e) {
            \Log::error('❌ Preview failed', ['error' => $e->getMessage()]);
            return response()->json(['success' => false, 'message' => '❌ Failed to load preview data.'], 500);
        }
    }
}