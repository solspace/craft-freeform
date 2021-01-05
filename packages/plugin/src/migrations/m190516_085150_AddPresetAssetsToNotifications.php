<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m190516_085150_AddPresetAssetsToNotifications migration.
 */
class m190516_085150_AddPresetAssetsToNotifications extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp()
    {
        $this->addColumn(
            '{{%freeform_notifications}}',
            'presetAssets',
            $this->string(255)
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown()
    {
        $this->dropColumn('{{%freeform_notifications}}', 'presetAssets');

        return true;
    }
}
