<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Form\Managers\ContentFixManager;

class m260223_205201_FixSubmissionTableNamesForCraft59 extends Migration
{
    public function safeUp(): bool
    {
        $craftVersion = \Craft::$app->getVersion();

        $runForCraft4 = version_compare($craftVersion, '4.17.0', '>=') && version_compare($craftVersion, '5.0.0', '<');
        $runForCraft5 = version_compare($craftVersion, '5.9.0', '>=');

        if (!($runForCraft4 || $runForCraft5)) {
            return true;
        }

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
