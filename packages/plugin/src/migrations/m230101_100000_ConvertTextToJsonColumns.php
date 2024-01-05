<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100000_ConvertTextToJsonColumns extends Migration
{
    public function safeUp(): bool
    {
        $this->alterColumn('{{%freeform_forms}}', 'metadata', $this->json());

        $this->alterColumn('{{%freeform_export_profiles}}', 'fields', $this->json());
        $this->alterColumn('{{%freeform_export_profiles}}', 'filters', $this->json());

        $this->alterColumn('{{%freeform_export_notifications}}', 'recipients', $this->json());

        $this->alterColumn('{{%freeform_export_settings}}', 'setting', $this->json());

        $this->alterColumn('{{%freeform_feed_messages}}', 'conditions', $this->json());

        $this->alterColumn('{{%freeform_session_context}}', 'propertyBag', $this->json());
        $this->alterColumn('{{%freeform_session_context}}', 'attributeBag', $this->json());

        return true;
    }

    public function safeDown(): bool
    {
        $this->alterColumn('{{%freeform_forms}}', 'metadata', $this->mediumText());

        $this->alterColumn('{{%freeform_export_profiles}}', 'fields', $this->text());
        $this->alterColumn('{{%freeform_export_profiles}}', 'filters', $this->text());

        $this->alterColumn('{{%freeform_export_notifications}}', 'recipients', $this->text());

        $this->alterColumn('{{%freeform_export_settings}}', 'setting', $this->mediumText());

        $this->alterColumn('{{%freeform_feed_messages}}', 'conditions', $this->text());

        $this->alterColumn('{{%freeform_session_context}}', 'propertyBag', $this->mediumText());
        $this->alterColumn('{{%freeform_session_context}}', 'attributeBag', $this->mediumText());

        return true;
    }
}
