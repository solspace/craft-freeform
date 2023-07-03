<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230616_083411_AddButtonLayoutToPages migration.
 */
class m230616_083411_AddMetadataToPages extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_forms_pages}}',
            'metadata',
            $this->json()
        );

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        $this->dropColumn('{{%freeform_forms_pages}}', 'metadata');

        return true;
    }
}
