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
            'toast' => session('toast'), // ✅ NEW: Pass toast message to frontend
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
     * 💾 Create new backup (SQLite, MySQL & PostgreSQL supported)
     */
    public function backupData(Request $request)
    {
        \Log::info("⚡ backupData() triggered by " . (auth()->user()->email ?? 'guest'));

        try {
            $backupDir = storage_path('app/backups');
            if (!file_exists($backupDir)) mkdir($backupDir, 0755, true);

            $timestamp = now()->format('Y-m-d_H-i-s');
            $connection = config('database.default');
            $backupFile = "{$backupDir}/backup-{$timestamp}." . ($connection === 'sqlite' ? 'sqlite' : 'sql');

            if ($connection === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                if (!file_exists($dbPath)) throw new \Exception('SQLite database file not found.');
                copy($dbPath, $backupFile);
            } else {
                $driver = DB::getDriverName();

                if ($driver === 'pgsql') {
                    // ✅ PostgreSQL version
                    $dbConfig = config("database.connections.pgsql");
                    $dbName = $dbConfig['database'];
                    $user = $dbConfig['username'];
                    $host = $dbConfig['host'];
                    $port = $dbConfig['port'];

                    // Try pg_dump first
                    $command = sprintf(
                        'PGPASSWORD=%s pg_dump -h %s -p %s -U %s -d %s > %s 2>&1',
                        escapeshellarg($dbConfig['password']),
                        escapeshellarg($host),
                        escapeshellarg($port),
                        escapeshellarg($user),
                        escapeshellarg($dbName),
                        escapeshellarg($backupFile)
                    );
                    shell_exec($command);

                    // 🧩 NEW: Fallback if pg_dump failed or produced empty file
                    if (!file_exists($backupFile) || filesize($backupFile) === 0) {
                        \Log::warning('pg_dump failed — using PHP fallback backup for PostgreSQL');
                        $tables = collect(DB::select("SELECT tablename FROM pg_tables WHERE schemaname='public';"))
                            ->pluck('tablename')->toArray();

                        $dump = "-- Laravel PostgreSQL Fallback Backup\n-- Database: {$dbName}\n-- Created: " . now() . "\n\n";
                        foreach ($tables as $table) {
                            $rows = DB::table($table)->get();
                            if ($rows->isNotEmpty()) {
                                foreach ($rows as $row) {
                                    $columns = array_map(fn($c) => "\"$c\"", array_keys((array)$row));
                                    $values = array_map(fn($v) => is_null($v) ? 'NULL' : DB::getPdo()->quote($v), array_values((array)$row));
                                    $dump .= "INSERT INTO \"$table\" (" . implode(',', $columns) . ") VALUES (" . implode(',', $values) . ");\n";
                                }
                                $dump .= "\n";
                            }
                        }
                        file_put_contents($backupFile, $dump);
                    }
                } else {
                    // ✅ MySQL version (unchanged)
                    $dbConfig = config("database.connections.mysql");
                    if (!$dbConfig) throw new \Exception('MySQL configuration missing.');
                    $dbName = $dbConfig['database'];

                    $tables = DB::getDriverName() === 'pgsql'
                        ? collect(DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public';"))
                            ->pluck('tablename')
                            ->toArray()
                        : collect(DB::select('SHOW TABLES'))
                            ->map(fn($t) => array_values((array)$t)[0])
                            ->toArray();

                    if (empty($tables)) throw new \Exception('No tables found in database.');

                    $dump = "-- Laravel Auto Backup\n-- Database: {$dbName}\n-- Created: " . now() . "\n\nSET FOREIGN_KEY_CHECKS=0;\n\n";
                    foreach ($tables as $table) {
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
            }

            if (!file_exists($backupFile) || filesize($backupFile) === 0) {
                throw new \Exception('Backup file not created or empty.');
            }

            $this->cleanupOldBackups($backupDir);

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('System Backup', 'Database backup created by ' . auth()->user()->name . ' (' . basename($backupFile) . ')');
            }

            $files = $this->getAllBackups();

            // ✅ NEW: Flash success toast for frontend
            session()->flash('toast', [
                'type' => 'success',
                'message' => '💾 Backup completed successfully!',
            ]);

            if ($request->expectsJson()) {
                return response()->json([
                    'success' => true,
                    'message' => '✅ Backup completed successfully.',
                    'backups' => $files,
                ]);
            }

            return redirect()->back()->with('success', '✅ Backup completed successfully.');

        } catch (\Throwable $e) {
            \Log::error('❌ Backup failed', ['error' => $e->getMessage()]);
            session()->flash('toast', [
                'type' => 'error',
                'message' => '❌ Backup failed: ' . $e->getMessage(),
            ]);
            return back()->with('error', '❌ Backup failed: ' . $e->getMessage());
        }
    }

    /** 🧹 Keep only latest 5 backups */
    private function cleanupOldBackups($dir)
    {
        $files = collect(glob("$dir/*"))
            ->sortByDesc(fn($f) => filemtime($f))
            ->skip(5);
        foreach ($files as $oldFile) @unlink($oldFile);
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

            return back()->with('success', "🗑️ Backup {$file} deleted successfully.");
        } catch (\Throwable $e) {
            return back()->with('error', '❌ Failed to delete backup: ' . $e->getMessage());
        }
    }

    /** 📥 Download backup file */
    public function downloadBackup($file)
    {
        $path = storage_path("app/backups/{$file}");
        if (!file_exists($path)) return back()->with('error', '⚠️ Backup file not found.');
        return response()->download($path);
    }

    /** 🩹 Restore a selected backup file */
    public function restoreData(Request $request)
    {
        try {
            $file = $request->input('file');
            if (!$file) throw new \Exception('No backup file selected.');

            $path = storage_path("app/backups/{$file}");
            if (!file_exists($path)) throw new \Exception('Selected backup file not found.');

            $driver = DB::getDriverName();
            $db = config("database.connections.{$driver}");

            if ($driver === 'sqlite') {
                copy($path, database_path('database.sqlite'));
            } elseif ($driver === 'pgsql') {
                $command = sprintf(
                    'PGPASSWORD=%s psql -h %s -p %s -U %s -d %s -f %s',
                    escapeshellarg($db['password']),
                    escapeshellarg($db['host']),
                    escapeshellarg($db['port']),
                    escapeshellarg($db['username']),
                    escapeshellarg($db['database']),
                    escapeshellarg($path)
                );
                shell_exec($command);
            } else {
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

            session()->flash('toast', [
                'type' => 'success',
                'message' => '✅ Database restored successfully from ' . basename($file),
            ]);

            return back()->with('success', '✅ Database restored successfully.');
        } catch (\Throwable $e) {
            session()->flash('toast', [
                'type' => 'error',
                'message' => '❌ Restore failed: ' . $e->getMessage(),
            ]);
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

            session()->flash('toast', [
                'type' => 'success',
                'message' => "✅ All data cleared successfully. Mode: {$keepMode}",
            ]);

            return back()->with('success', "✅ All data cleared successfully. Mode: {$keepMode}");
        } catch (\Throwable $e) {
            DB::rollBack();
            session()->flash('toast', [
                'type' => 'error',
                'message' => '❌ Reset failed: ' . $e->getMessage(),
            ]);
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
            return response()->json(['success' => false, 'message' => '❌ Failed to load preview data.'], 500);
        }
    }
}