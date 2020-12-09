<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m180326_094124_AddIsSpamToSubmissions migration.
 */
class m180326_094124_AddIsSpamToSubmissions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn(
            '{{%freeform_submissions}}',
            'isSpam',
            $this->boolean()->defaultValue(false)
        );
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn(
            '{{%freeform_submissions}}',
            'isSpam'
        );
    }
}
