<?php

namespace Solspace\Freeform\Library\Migrations;

use craft\db\Migration;

/** Schema changes must not open the Yii adapter's unconditional transaction. */
abstract class Craft6SchemaMigration extends Migration
{
    public function up(bool $throwExceptions = false): bool
    {
        // MySQL implicitly commits DDL. Laravel's migrator already applies a
        // transaction when the database supports transactional schema changes.
        // Throw failures: the adapter wrapper does not inspect a false result.
        if (false === $this->safeUp()) {
            throw new \RuntimeException('Freeform schema migration did not complete.');
        }

        $this->afterUp();

        return true;
    }
}
