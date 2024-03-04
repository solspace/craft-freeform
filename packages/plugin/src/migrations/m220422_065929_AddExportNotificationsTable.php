<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use Solspace\Freeform\Library\Migrations\ForeignKey;

class m220422_065929_AddExportNotificationsTable extends Migration
{
    public function safeUp(): bool
    {
        if (!$this->db->tableExists('{{%freeform_export_notifications}}')) {
            $this->createTable(
                '{{%freeform_export_notifications}}',
                [
                    'id' => $this->primaryKey(),
                    'profileId' => $this->integer()->notNull(),
                    'name' => $this->string(255)->notNull()->unique(),
                    'fileType' => $this->string(30)->notNull(),
                    'fileName' => $this->string(255),
                    'frequency' => $this->string(20)->notNull(),
                    'recipients' => $this->text()->notNull(),
                    'subject' => $this->string(255),
                    'message' => $this->text(),

                    'dateCreated' => $this->dateTime(),
                    'dateUpdated' => $this->dateTime(),
                    'uid' => $this->uid(),
                ]
            );

            $this->addForeignKey(
                null,
                '{{%freeform_export_notifications}}',
                'profileId',
                '{{%freeform_export_profiles}}',
                'id',
                ForeignKey::CASCADE
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $keys = $this->db->schema->getTableForeignKeys('{{%freeform_export_notifications}}');
        foreach ($keys as $key) {
            $this->dropForeignKey($key->name, '{{%freeform_export_notifications}}');
        }

        $this->dropTableIfExists('{{%freeform_export_notifications}}');

        return true;
    }
}
