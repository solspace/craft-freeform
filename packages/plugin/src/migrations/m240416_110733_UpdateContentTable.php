<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use craft\migrations\BaseContentRefactorMigration;
use Solspace\Freeform\Elements\Submission;

if (class_exists(BaseContentRefactorMigration::class, false)) {
    /**
     * m240416_110733_UpdateContentTable migration.
     */
    class m240416_110733_UpdateContentTable extends BaseContentRefactorMigration
    {
        public function safeUp(): bool
        {
            // update users
            $this->updateElements(
                (new Query())->from(Submission::TABLE),
                null,
            );

            return true;
        }

        public function safeDown(): bool
        {
            echo "m240416_110733_UpdateContentTable cannot be reverted.\n";

            return false;
        }
    }
} else {
    class m240416_110733_UpdateContentTable extends Migration
    {
        public function safeUp(): bool
        {
            echo "m240416_110733_UpdateContentTable skipped for Craft 4 and less.\n";

            return true;
        }

        public function safeDown(): bool
        {
            echo "m240416_110733_UpdateContentTable cannot be reverted.\n";

            return false;
        }
    }
}
