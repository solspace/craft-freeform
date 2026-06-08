<?php

namespace Solspace\Freeform\Library\Compatibility;

use craft\db\Migration as CraftMigration;
use CraftCms\Cms\Database\Migrator;
use CraftCms\Yii2Adapter\Database\MigrationWrapper;

/**
 * Wraps legacy craft\db\Migration classes for Laravel's migrator.
 */
class FreeformMigrator extends Migrator
{
    #[\Override]
    public function resolve($file)
    {
        return $this->wrapCraftMigration(parent::resolve($file));
    }

    #[\Override]
    protected function resolvePath(string $path)
    {
        return $this->wrapCraftMigration(parent::resolvePath($path));
    }

    private function wrapCraftMigration(object $migration): object
    {
        if ($migration instanceof MigrationWrapper) {
            return $migration;
        }

        $class = $migration::class;

        if (is_a($class, CraftMigration::class, true)) {
            return new MigrationWrapper($class);
        }

        return $migration;
    }
}
