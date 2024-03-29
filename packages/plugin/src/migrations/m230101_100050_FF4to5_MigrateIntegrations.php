<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

class m230101_100050_FF4to5_MigrateIntegrations extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_forms_integrations}}',
            [
                'id' => $this->primaryKey(),
                'integrationId' => $this->integer()->notNull(),
                'formId' => $this->integer()->notNull(),
                'enabled' => $this->boolean()->defaultValue(true),
                'metadata' => $this->longText(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_integrations}}',
            ['integrationId'],
            '{{%freeform_integrations}}',
            ['id'],
            ForeignKey::CASCADE,
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_integrations}}',
            ['formId'],
            '{{%freeform_forms}}',
            ['id'],
            ForeignKey::CASCADE,
        );

        $this->delete('{{%freeform_integrations}}');

        return true;
    }

    public function safeDown(): bool
    {
        echo "m230101_100050_FF4to5_MigrateIntegrations cannot be reverted.\n";

        return false;
    }
}
