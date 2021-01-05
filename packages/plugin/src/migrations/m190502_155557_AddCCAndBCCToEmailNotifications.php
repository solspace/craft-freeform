<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190502_155557_AddCCAndBCCToEmailNotifications migration.
 */
class m190502_155557_AddCCAndBCCToEmailNotifications extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn(
            '{{%freeform_notifications}}',
            'cc',
            $this->string(255)
        );

        $this->addColumn(
            '{{%freeform_notifications}}',
            'bcc',
            $this->string(255)
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('{{%freeform_notifications}}', 'cc');
        $this->dropColumn('{{%freeform_notifications}}', 'bcc');

        return true;
    }
}
