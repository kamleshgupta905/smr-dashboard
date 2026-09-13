<?php

namespace App\Console\Commands;

use App\Services\ZampliaSupplyService;
use Illuminate\Console\Command;

class SyncZampliaSurveys extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'zamplia:sync-surveys {--top-picks : Also display top pick surveys}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Synchronize allocated surveys from Zamplia Supply API into local database';

    /**
     * Execute the console command.
     */
    public function handle(ZampliaSupplyService $zampliaService): int
    {
        $this->info('Starting Zamplia Survey Sync...');

        $result = $zampliaService->syncSurveysToDatabase();

        if ($result['success']) {
            $this->info("✓ " . $result['message']);

            if ($this->option('top-picks')) {
                $this->info('Fetching Top Pick Surveys...');
                $topPicks = $zampliaService->getTopPickSurveys();
                if ($topPicks['success']) {
                    $count = count($topPicks['data'] ?? []);
                    $this->info("✓ Found {$count} Top Pick surveys.");
                } else {
                    $this->warn("! Could not fetch top picks: " . ($topPicks['message'] ?? 'Unknown error'));
                }
            }

            return Command::SUCCESS;
        }

        $this->error('✗ Sync failed: ' . ($result['message'] ?? 'Unknown error'));
        return Command::FAILURE;
    }
}
