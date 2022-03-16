<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Records\FormRecord;

class m220316_060248_SwitchFormSuccessBehaviourToRedirectReturnUrl extends Migration
{
    public function safeUp(): bool
    {
        $results = (new Query())
            ->select(['id', 'metadata'])
            ->from(FormRecord::TABLE)
            ->pairs()
        ;

        foreach ($results as $id => $metadata) {
            if (str_contains($metadata, '"successBehaviour":"no-effect"')) {
                $updatedMetadata = str_replace(
                    '"successBehaviour":"no-effect"',
                    '"successBehaviour":"reload"',
                    $metadata
                );

                $this->update(
                    FormRecord::TABLE,
                    ['metadata' => $updatedMetadata],
                    ['id' => $id]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        echo "m220316_060248_SwitchFormSuccessBahaviourToRedirectReturnUrl cannot be reverted.\n";

        return false;
    }
}
