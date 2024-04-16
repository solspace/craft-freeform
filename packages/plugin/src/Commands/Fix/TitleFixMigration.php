<?php

namespace Solspace\Freeform\Commands\Fix;

use craft\db\Query;
use craft\migrations\BaseContentRefactorMigration;
use Solspace\Freeform\Elements\Submission;

class TitleFixMigration extends BaseContentRefactorMigration
{
    protected bool $preserveOldData = true;

    public function run(): void
    {
        // update users
        $this->updateElements(
            (new Query())->from(Submission::TABLE),
            null,
        );
    }
}
