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
        $class = $this->getMigrationClass($file);
        if (is_a($class, CraftMigration::class, true)) {
            return new MigrationWrapper($class);
        }

        return $this->wrapCraftMigration(parent::resolve($file));
    }

    #[\Override]
    protected function resolvePath(string $path)
    {
        $class = $this->getMigrationClass($this->getMigrationName($path));
        if (str_starts_with($class, 'Solspace\Freeform\migrations\\')) {
            $this->files->requireOnce($path);

            return new MigrationWrapper($class);
        }

        return $this->wrapCraftMigration(parent::resolvePath($path));
    }

    #[\Override]
    protected function getMigrationClass(string $migrationName): string
    {
        if (preg_match('/^m\d{6}_\d{6}_/', $migrationName)) {
            return 'Solspace\Freeform\migrations\\'.$migrationName;
        }

        return parent::getMigrationClass($migrationName);
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
