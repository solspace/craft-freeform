<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Form\Managers\ContentFixManager;

class m260223_205201_FixSubmissionTableNamesForCraft59 extends Migration
{
    public function safeUp(): bool
    {
        $manager = new ContentFixManager();

        $manager->onNotFound = static function ($table) {
            echo "Could not find form handle for submission table {$table}\n";
        };

        $manager->onRename = static function ($table, $oldTable, $newTable) {
            echo "Renaming table {$oldTable} to {$newTable}\n";
        };

        $manager->fixTableNames();

        return true;
    }

    public function safeDown(): bool
    {
        echo "m260223_205201_FixSubmissionTableNamesForCraft59 cannot be reverted.\n";

        return true;
    }
}
