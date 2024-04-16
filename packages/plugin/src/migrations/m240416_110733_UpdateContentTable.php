<?php

namespace Solspace\Freeform\migrations;

use craft\db\Query;
use craft\migrations\BaseContentRefactorMigration;
use Solspace\Freeform\Elements\Submission;

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
