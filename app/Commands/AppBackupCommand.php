<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use ZipArchive;
use Carbon\Carbon;

class AppBackupCommand extends Command
{
    protected $signature = 'app:backup';
    protected $description = 'Create a full backup of code, .env, and database';

    public function handle()
    {
        $timestamp = Carbon::now()->format('Y_m_d_His');
        $backupDir = base_path('backups');
        if (!is_dir($backupDir)) {
            mkdir($backupDir, 0755, true);
        }

        $backupName = "backup_{$timestamp}.zip";
        $backupPath = "{$backupDir}/{$backupName}";

        $this->info("Creating backup: {$backupPath}");

        $zip = new ZipArchive();
        if ($zip->open($backupPath, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            $this->error('Could not create zip file.');
            return Command::FAILURE;
        }

        // Add main directories (skip node_modules and vendor for size)
        $dirs = ['app', 'bootstrap', 'config', 'database', 'public', 'resources', 'routes'];
        foreach ($dirs as $dir) {
            $this->addFolderToZip(base_path($dir), $zip, $dir);
        }

        // Add .env if present
        $envPath = base_path('.env');
        if (file_exists($envPath)) {
            $zip->addFile($envPath, '.env');
        }

        // Add composer & package info
        foreach (['composer.json', 'composer.lock', 'package.json', 'vite.config.js'] as $file) {
            $path = base_path($file);
            if (file_exists($path)) {
                $zip->addFile($path, $file);
            }
        }

        $zip->close();

        $this->info('✅ Backup completed successfully!');
        $this->info("Saved at: {$backupPath}");
        return Command::SUCCESS;
    }

    private function addFolderToZip($folder, ZipArchive $zip, $base)
    {
        $files = new \RecursiveIteratorIterator(
            new \RecursiveDirectoryIterator($folder),
            \RecursiveIteratorIterator::LEAVES_ONLY
        );

        foreach ($files as $name => $file) {
            if (!$file->isDir()) {
                $filePath = $file->getRealPath();
                $relativePath = $base . '/' . substr($filePath, strlen($folder) + 1);

                // Skip large or unnecessary directories
                if (str_contains($relativePath, 'node_modules') || str_contains($relativePath, 'vendor')) {
                    continue;
                }

                $zip->addFile($filePath, $relativePath);
            }
        }
    }
}