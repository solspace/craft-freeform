<?php

namespace Solspace\Freeform\Library\Migrations;

use craft\db\Migration;

abstract class StreamlinedInstallMigration extends Migration
{
    final public function safeUp(): bool
    {
        if (!$this->beforeInstall()) {
            return false;
        }

        foreach ($this->defineTableData() as $table) {
            if ($this->db->tableExists($table->getDatabaseName())) {
                continue;
            }

            $table->addField('dateCreated', $this->dateTime()->notNull());
            $table->addField('dateUpdated', $this->dateTime()->notNull());
            $table->addField('uid', $this->uid());

            $this->createTable($table->getDatabaseName(), $table->getFieldArray(), $table->getOptions());

            foreach ($table->getIndexes() as $index) {
                $this->createIndex(
                    $table->getName().'_'.$index->getName(),
                    $table->getDatabaseName(),
                    $index->getColumns(),
                    $index->isUnique()
                );
            }
        }

        foreach ($this->defineTableData() as $table) {
            foreach ($table->getForeignKeys() as $foreignKey) {
                try {
                    $this->addForeignKey(
                        $foreignKey->getName(),
                        $table->getDatabaseName(),
                        $foreignKey->getColumn(),
                        $foreignKey->getDatabaseReferenceTableName(),
                        $foreignKey->getReferenceColumn(),
                        $foreignKey->getOnDelete(),
                        $foreignKey->getOnUpdate()
                    );
                } catch (\Exception $e) {
                    \Craft::warning("Failed to add FK {$foreignKey->getName()}: ".$e->getMessage(), __METHOD__);
                }
            }
        }

        return $this->afterInstall();
    }

    final public function safeDown(): bool
    {
        // PostgreSQL: recover from failed transaction before proceeding
        if (
            'pgsql' === $this->db->getDriverName()
            && null !== $this->db->getTransaction()
        ) {
            try {
                $this->db->pdo->rollBack();
                \Craft::warning('Rolled back aborted PostgreSQL transaction before uninstall.', __METHOD__);
            } catch (\Throwable $e) {
                \Craft::warning('Could not roll back aborted PostgreSQL transaction: '.$e->getMessage(), __METHOD__);
            }
        }

        if (!$this->beforeUninstall()) {
            return false;
        }

        if ($this instanceof KeepTablesAfterUninstallInterface) {
            return true;
        }

        $tables = $this->defineTableData();

        // Drop foreign keys
        foreach ($tables as $table) {
            $tableName = $table->getDatabaseName();

            $schema = null;

            try {
                $schema = $this->db->getTableSchema($tableName, true);
            } catch (\Throwable $e) {
                \Craft::warning("Failed to get table schema for {$tableName}: ".$e->getMessage(), __METHOD__);
            }

            if (!$schema) {
                continue;
            }

            foreach ($table->getForeignKeys() as $foreignKey) {
                try {
                    $this->dropForeignKey($foreignKey->getName(), $tableName);
                } catch (\Throwable $e) {
                    \Craft::warning("Failed to drop FK {$foreignKey->getName()} on {$tableName}: ".$e->getMessage(), __METHOD__);
                }
            }
        }

        // Drop tables
        $tables = array_reverse($tables);
        foreach ($tables as $table) {
            $tableName = $table->getDatabaseName();

            $schema = null;

            try {
                $schema = $this->db->getTableSchema($tableName, true);
            } catch (\Throwable $e) {
                \Craft::warning("Failed to get table schema for {$tableName} during drop: ".$e->getMessage(), __METHOD__);

                continue;
            }

            if (!$schema) {
                continue;
            }

            try {
                $this->dropTable($tableName);
            } catch (\Throwable $e) {
                \Craft::warning("Failed to drop table {$tableName}: ".$e->getMessage(), __METHOD__);
            }
        }

        return $this->afterUninstall();
    }

    /**
     * @return Table[]
     */
    abstract protected function defineTableData(): array;

    protected function beforeInstall(): bool
    {
        return true;
    }

    protected function afterInstall(): bool
    {
        return true;
    }

    protected function beforeUninstall(): bool
    {
        return true;
    }

    protected function afterUninstall(): bool
    {
        return true;
    }
}
