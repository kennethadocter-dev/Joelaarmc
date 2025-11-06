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
    private function basePath(): string
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
            if (!$user || $user->role !== 'superadmin') {
                abort(403, 'Access denied. Only Superadmin can access System Control.');
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

        // ✅ Superadmin only — Inertia view path matches your folder
        return Inertia::render('Superadmin/System/Index', [
            'auth'     => ['user' => auth()->user()],
            'stats'    => $stats,
            'basePath' => $this->basePath(),
            'backups'  => $this->getAllBackups(),
        ]);
    }

    /** 🕒 Get timestamp of latest backup */
    private function getLastBackupTime(): string
    {
        $backupPath = storage_path('app/backups');
        $latest = collect(glob("$backupPath/*"))
            ->filter(fn($f) => str_ends_with($f, '.sqlite') || str_ends_with($f, '.sql') || str_ends_with($f, '.zip'))
            ->sortByDesc(fn($f) => filemtime($f))
            ->first();

        return $latest
            ? Carbon::createFromTimestamp(filemtime($latest))->diffForHumans()
            : 'No backups yet';
    }

    /** 📦 Get all backups from storage/app/backups */
    private function getAllBackups(): array
    {
        $backupPath = storage_path('app/backups');
        if (!file_exists($backupPath)) return [];

        return collect(glob("$backupPath/*"))
            ->filter(fn($f) => str_ends_with($f, '.sqlite') || str_ends_with($f, '.sql') || str_ends_with($f, '.zip'))
            ->sortByDesc(fn($f) => filemtime($f))
            ->map(fn($f) => [
                'file' => basename($f),
                'size' => round(filesize($f) / 1024, 1) . ' KB',
                'date' => Carbon::createFromTimestamp(filemtime($f))->toDateTimeString(),
            ])
            ->values()
            ->toArray();
    }

    /** 💾 Create a new backup */
    public function backupData(Request $request)
    {
        try {
            $backupDir = storage_path('app/backups');
            if (!file_exists($backupDir)) mkdir($backupDir, 0755, true);

            $timestamp = now()->format('Y-m-d_H-i-s');
            $driver = DB::getDriverName();
            $backupFile = "{$backupDir}/backup-{$timestamp}." . ($driver === 'sqlite' ? 'sqlite' : 'sql');

            if ($driver === 'sqlite') {
                $dbPath = database_path('database.sqlite');
                if (!file_exists($dbPath)) throw new \Exception('SQLite database file not found.');
                copy($dbPath, $backupFile);
            } elseif ($driver === 'pgsql') {
                $dbConfig = config("database.connections.pgsql");
                $dbName = $dbConfig['database'];
                $tables = collect(DB::select("SELECT tablename FROM pg_tables WHERE schemaname='public';"))
                    ->pluck('tablename')->toArray();

                $dump = "-- PostgreSQL Backup for {$dbName} - " . now() . "\n\n";
                foreach ($tables as $table) {
                    $rows = DB::table($table)->get();
                    foreach ($rows as $row) {
                        $cols = array_map(fn($c) => "\"$c\"", array_keys((array)$row));
                        $vals = array_map(fn($v) => is_null($v) ? 'NULL' : DB::getPdo()->quote($v), array_values((array)$row));
                        $dump .= "INSERT INTO \"$table\" (" . implode(',', $cols) . ") VALUES (" . implode(',', $vals) . ");\n";
                    }
                    $dump .= "\n";
                }
                file_put_contents($backupFile, $dump);
            } else {
                $dbConfig = config("database.connections.mysql");
                $dbName = $dbConfig['database'];
                $tables = collect(DB::select('SHOW TABLES'))->map(fn($t) => array_values((array)$t)[0])->toArray();

                $dump = "-- MySQL Backup: {$dbName} | " . now() . "\n\nSET FOREIGN_KEY_CHECKS=0;\n\n";
                foreach ($tables as $table) {
                    $create = DB::select("SHOW CREATE TABLE `$table`")[0]->{'Create Table'};
                    $dump .= "DROP TABLE IF EXISTS `$table`;\n$create;\n\n";
                    $rows = DB::table($table)->get();
                    foreach ($rows as $row) {
                        $columns = array_map(fn($c) => "`$c`", array_keys((array)$row));
                        $values = array_map(fn($v) => is_null($v) ? 'NULL' : DB::getPdo()->quote($v), array_values((array)$row));
                        $dump .= "INSERT INTO `$table` (" . implode(',', $columns) . ") VALUES (" . implode(',', $values) . ");\n";
                    }
                    $dump .= "\n";
                }
                $dump .= "SET FOREIGN_KEY_CHECKS=1;\n";
                file_put_contents($backupFile, $dump);
            }

            $this->cleanupOldBackups($backupDir);

            if (class_exists(\App\Helpers\ActivityLogger::class)) {
                \App\Helpers\ActivityLogger::log('System Backup', 'Backup created by ' . auth()->user()->name);
            }

            return response()->json([
                'success' => true,
                'message' => '✅ Backup completed successfully.',
                'backups' => $this->getAllBackups(),
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => '❌ Backup failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /** 🧹 Keep only 5 latest backups */
    private function cleanupOldBackups($dir): void
    {
        $files = collect(glob("$dir/*"))->sortByDesc(fn($f) => filemtime($f))->skip(5);
        foreach ($files as $oldFile) @unlink($oldFile);
    }

    /** 📋 List backups */
    public function listBackups()
    {
        return response()->json(['backups' => $this->getAllBackups()]);
    }

    /** 🗑️ Delete backup */
    public function deleteBackup($file)
    {
        try {
            $path = storage_path("app/backups/{$file}");
            if (!file_exists($path)) {
                return response()->json(['success' => false, 'message' => '⚠️ Backup file not found.'], 404);
            }
            unlink($path);
            return response()->json([
                'success' => true,
                'message' => '🗑️ Backup deleted successfully.',
                'backups' => $this->getAllBackups(),
            ]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => '❌ Delete failed: ' . $e->getMessage()], 500);
        }
    }

    /** 📥 Download backup */
    public function downloadBackup($file)
    {
        $path = storage_path("app/backups/{$file}");
        if (!file_exists($path)) {
            return back()->with('error', '⚠️ Backup file not found.');
        }
        return response()->download($path);
    }

    /** 📤 Upload backup */
    public function uploadBackup(Request $request)
    {
        $request->validate(['backup_file' => 'required|file|mimes:zip,sql,sqlite|max:51200']);
        $file = $request->file('backup_file');
        $path = storage_path('app/backups');
        if (!file_exists($path)) mkdir($path, 0755, true);

        $filename = time() . '_' . $file->getClientOriginalName();
        $file->move($path, $filename);

        if (class_exists(\App\Helpers\ActivityLogger::class)) {
            \App\Helpers\ActivityLogger::log('System Upload', 'Backup uploaded by ' . auth()->user()->name);
        }

        return response()->json([
            'success' => true,
            'message' => '✅ Backup uploaded successfully!',
            'backups' => $this->getAllBackups(),
        ]);
    }

    /** ♻️ Restore from backup */
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
                $cmd = sprintf(
                    'PGPASSWORD=%s psql -h %s -p %s -U %s -d %s -f %s',
                    escapeshellarg($db['password']),
                    escapeshellarg($db['host']),
                    escapeshellarg($db['port']),
                    escapeshellarg($db['username']),
                    escapeshellarg($db['database']),
                    escapeshellarg($path)
                );
                shell_exec($cmd);
            } else {
                $cmd = sprintf(
                    'mysql -u%s -p%s %s < %s',
                    escapeshellarg($db['username']),
                    escapeshellarg($db['password']),
                    escapeshellarg($db['database']),
                    escapeshellarg($path)
                );
                shell_exec($cmd);
            }

            return response()->json(['success' => true, 'message' => '✅ Database restored successfully.']);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => '❌ Restore failed: ' . $e->getMessage()], 500);
        }
    }

    /** 🔄 Reset all data */
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
                if (Schema::hasTable($table)) DB::table($table)->truncate();
            }

            $keepRoles = match ($keepMode) {
                'keep_all_staff' => ['superadmin', 'admin', 'staff'],
                'keep_admins'    => ['superadmin', 'admin'],
                default          => ['superadmin'],
            };

            User::whereNotIn('role', $keepRoles)->delete();
            Schema::enableForeignKeyConstraints();
            DB::commit();

            return response()->json(['success' => true, 'message' => "✅ All data cleared successfully. Mode: {$keepMode}"]);
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => '❌ Reset failed: ' . $e->getMessage()], 500);
        }
    }

    /** 🧠 Preview before reset */
    public function previewReset()
    {
        try {
            $stats = [
                'customers' => DB::table('customers')->count(),
                'loans'     => DB::table('loans')->count(),
                'payments'  => DB::table('payments')->count(),
                'users'     => DB::table('users')->count(),
            ];
            return response()->json(['success' => true, 'stats' => $stats]);
        } catch (\Throwable $e) {
            return response()->json(['success' => false, 'message' => '❌ Failed to load preview data: ' . $e->getMessage()], 500);
        }
    }
}