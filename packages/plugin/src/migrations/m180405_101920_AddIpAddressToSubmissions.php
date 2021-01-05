<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m180405_101920_AddIpAddressToSubmissions migration.
 */
class m180405_101920_AddIpAddressToSubmissions extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_submissions}}',
            'ip',
            $this->string(46)->null()
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $this->dropColumn('{{%freeform_submissions}}', 'ip');

        return true;
    }
}
