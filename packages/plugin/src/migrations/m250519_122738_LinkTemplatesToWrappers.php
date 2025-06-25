<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m250519_122738_LinkTemplatesToWrappers migration.
 */
class m250519_122738_LinkTemplatesToWrappers extends Migration
{
    public function safeUp(): bool
    {
        $this->addColumn(
            '{{%freeform_notification_templates}}',
            'wrapperId',
            $this->integer()->after('formId')->null()
        );

        $this->addForeignKey(
            'fk_wrapperId',
            '{{%freeform_notification_templates}}',
            'wrapperId',
            '{{%freeform_notification_template_wrappers}}',
            'id',
            'SET NULL',
        );

        return true;
    }

    public function safeDown(): bool
    {
        if (!$this->db->columnExists('{{%freeform_notification_templates}}', 'wrapperId')) {
            return true;
        }

        $this->dropForeignKey(
            'fk_wrapperId',
            '{{%freeform_notification_templates}}'
        );

        $this->dropColumn(
            '{{%freeform_notification_templates}}',
            'wrapperId'
        );
    }
}
