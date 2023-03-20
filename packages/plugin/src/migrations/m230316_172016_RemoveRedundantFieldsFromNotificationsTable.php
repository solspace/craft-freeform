<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m230316_172016_RemoveRedundantFieldsFromNotificationsTable migration.
 */
class m230316_172016_RemoveRedundantFieldsFromNotificationsTable extends Migration
{
    /**
     * {@inheritdoc}
     */
    public function safeUp(): bool
    {
        $this->dropColumn('{{%freeform_integrations}}', 'subject');
        $this->dropColumn('{{%freeform_integrations}}', 'fromName');
        $this->dropColumn('{{%freeform_integrations}}', 'fromEmail');
        $this->dropColumn('{{%freeform_integrations}}', 'replyToName');
        $this->dropColumn('{{%freeform_integrations}}', 'replyToEmail');
        $this->dropColumn('{{%freeform_integrations}}', 'cc');
        $this->dropColumn('{{%freeform_integrations}}', 'bbc');
        $this->dropColumn('{{%freeform_integrations}}', 'bodyHtml');
        $this->dropColumn('{{%freeform_integrations}}', 'bodyText');
        $this->dropColumn('{{%freeform_integrations}}', 'autoText');
        $this->dropColumn('{{%freeform_integrations}}', 'includeAttachments');
        $this->dropColumn('{{%freeform_integrations}}', 'presetAssets');
        $this->dropColumn('{{%freeform_integrations}}', 'sortOrder');
        $this->alterColumn('{{%freeform_integrations}}', 'description', $this->longText());
        $this->renameColumn('{{%freeform_integrations}}', 'description', 'metadata');

        return true;
    }

    /**
     * {@inheritdoc}
     */
    public function safeDown(): bool
    {
        echo "m230316_172016_RemoveRedundantFieldsFromNotificationsTable cannot be reverted.\n";

        return false;
    }
}
