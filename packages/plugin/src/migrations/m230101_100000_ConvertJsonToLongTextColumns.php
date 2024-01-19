<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m230101_100000_ConvertJsonToLongTextColumns extends Migration
{
    public function safeUp(): bool
    {
        $this->alterColumn('{{%freeform_forms}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_export_profiles}}', 'fields', $this->longText());
        $this->alterColumn('{{%freeform_export_profiles}}', 'filters', $this->longText());

        $this->alterColumn('{{%freeform_export_notifications}}', 'recipients', $this->longText());

        $this->alterColumn('{{%freeform_export_settings}}', 'setting', $this->longText());

        $this->alterColumn('{{%freeform_feed_messages}}', 'conditions', $this->longText());

        $this->alterColumn('{{%freeform_session_context}}', 'propertyBag', $this->longText());
        $this->alterColumn('{{%freeform_session_context}}', 'attributeBag', $this->longText());

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
