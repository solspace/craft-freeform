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
                    \Craft::warning($e->getMessage());
                }
            }
        }

        return $this->afterInstall();
    }

    final public function safeDown(): bool
    {
        if (!$this->beforeUninstall()) {
            return false;
        }

        if ($this instanceof KeepTablesAfterUninstallInterface) {
            return true;
        }

        $tables = $this->defineTableData();

        foreach ($tables as $table) {
            if (!$this->db->tableExists($table->getDatabaseName())) {
                continue;
            }

            foreach ($table->getForeignKeys() as $foreignKey) {
                try {
                    $this->dropForeignKey($foreignKey->getName(), $table->getDatabaseName());
                } catch (\Exception $e) {
                    \Craft::warning($e->getMessage());
                }
            }
        }

        $tables = array_reverse($tables);
        foreach ($tables as $table) {
            $this->dropTableIfExists($table->getDatabaseName());
        }

        return $this->afterUninstall();
    }

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
