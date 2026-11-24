<?php

namespace Solspace\Freeform\migrations;

use Solspace\Freeform\Library\Forms\Merge\BackgroundMergeTables;
use Solspace\Freeform\Library\Migrations\KeepTablesAfterUninstallInterface;
use Solspace\Freeform\Library\Migrations\StreamlinedInstallMigration;

class m261123_193000_AddBackgroundFormMerges extends StreamlinedInstallMigration implements KeepTablesAfterUninstallInterface
{
    protected function defineTableData(): array
    {
        return BackgroundMergeTables::definitions($this);
    }
}
