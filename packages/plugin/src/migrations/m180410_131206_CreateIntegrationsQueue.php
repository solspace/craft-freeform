<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Commons\Migrations\ForeignKey;

/**
 * m180410_131206_CreateIntegrationsQueue migration.
 */
class m180410_131206_CreateIntegrationsQueue extends Migration
{
    public function safeUp()
    {
        $this->dropTableIfExists('freeform_integrations_queue');
        $this->createTable('{{%freeform_integrations_queue}}', [
            'id' => $this->primaryKey(),
            'submissionId' => $this->integer()->notNull(),
            'fieldHash' => $this->string(20),
            'integrationType' => $this->string(50)->notNull(),
            'status' => $this->string(50)->notNull(),
            'dateCreated' => $this->dateTime(),
            'dateUpdated' => $this->dateTime(),
            'uid' => $this->uid(),
        ]);
        $this->createIndex(null, '{{%freeform_integrations_queue}}', 'status');
        $this->addForeignKey(
            null,
            '{{%freeform_integrations_queue}}',
            'submissionId',
            '{{%freeform_submissions}}',
            'id',
            ForeignKey::CASCADE
        );

        return true;
    }

    public function safeDown()
    {
        $this->dropTable('{{%freeform_integrations_queue}}');

        return true;
    }
}
