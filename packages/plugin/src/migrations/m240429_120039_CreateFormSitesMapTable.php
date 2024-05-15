<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Library\Migrations\ForeignKey;

class m240429_120039_CreateFormSitesMapTable extends Migration
{
    public function safeUp(): bool
    {
        $this->createTable(
            '{{%freeform_forms_sites}}',
            [
                'id' => $this->primaryKey(),
                'formId' => $this->integer()->notNull(),
                'siteId' => $this->integer()->notNull(),
                'dateCreated' => $this->dateTime()->notNull(),
                'dateUpdated' => $this->dateTime()->notNull(),
                'uid' => $this->uid(),
            ]
        );

        $this->createIndex(
            null,
            '{{%freeform_forms_sites}}',
            ['siteId', 'formId'],
            true
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_sites}}',
            'formId',
            '{{%freeform_forms}}',
            'id',
            ForeignKey::CASCADE,
            ForeignKey::CASCADE
        );

        $this->addForeignKey(
            null,
            '{{%freeform_forms_sites}}',
            'siteId',
            '{{%sites}}',
            'id',
            ForeignKey::CASCADE,
            ForeignKey::CASCADE
        );

        $formIds = (new Query())
            ->select('id')
            ->from('{{%freeform_forms}}')
            ->column()
        ;

        $siteIds = (new Query())
            ->select('id')
            ->from('{{%sites}}')
            ->column()
        ;

        foreach ($formIds as $formId) {
            foreach ($siteIds as $siteId) {
                $this->insert(
                    '{{%freeform_forms_sites}}',
                    ['formId' => $formId, 'siteId' => $siteId]
                );
            }
        }

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropAllForeignKeysToTable('{{%freeform_forms_sites}}');
        $this->dropTableIfExists('{{%freeform_forms_sites}}');

        return true;
    }
}
