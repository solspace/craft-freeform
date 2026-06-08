<?php

namespace Solspace\Freeform\Library\Compatibility;

use craft\db\Migration as CraftMigration;
use CraftCms\Cms\Database\MigrationRepository;
use CraftCms\Cms\Database\Migrator;
use CraftCms\Cms\Database\Table;
use CraftCms\Yii2Adapter\Database\MigrationWrapper;
use Illuminate\Database\Migrations\MigrationRepositoryInterface;
use yii\base\Event;

/**
 * Craft CMS 6 compatibility helpers for legacy Yii migrations and plugin events.
 */
trait Craft6PluginTrait
{
    public function getMigrator(): Migrator
    {
        if (isset($this->migrator)) {
            return $this->migrator;
        }

        if (!$this->app->bound(FreeformMigrator::class)) {
            $this->app
                ->when(FreeformMigrator::class)
                ->needs(MigrationRepositoryInterface::class)
                ->give(fn () => $this->app->make(MigrationRepository::class, ['table' => Table::MIGRATIONS]))
            ;

            $this->app->singleton(FreeformMigrator::class, FreeformMigrator::class);
        }

        return $this->migrator = $this->app
            ->make(FreeformMigrator::class)
            ->track("plugin:{$this->handle}")
            ->setPaths([$this->getMigrationsPath()])
        ;
    }

    protected function triggerPluginEvent(string $name, Event $event): void
    {
        Event::trigger($this, $name, $event);
    }

    protected function wrapCraftMigrationObject(object $migration): object
    {
        if ($migration instanceof MigrationWrapper) {
            return $migration;
        }

        if (is_a($migration::class, CraftMigration::class, true)) {
            return new MigrationWrapper($migration::class);
        }

        return $migration;
    }
}
