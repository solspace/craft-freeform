<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * m240115_170305_ConvertJsonToLongTextColumns migration.
 */
class m240115_170305_ConvertJsonToLongTextColumns extends Migration
{
    public function safeUp(): bool
    {
        $this->alterColumn('{{%freeform_forms}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_forms_pages}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_forms_fields}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_forms_integrations}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_forms_notifications}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_favorite_fields}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_integrations}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_export_profiles}}', 'fields', $this->longText());
        $this->alterColumn('{{%freeform_export_profiles}}', 'filters', $this->longText());

        $this->alterColumn('{{%freeform_export_notifications}}', 'recipients', $this->longText());

        $this->alterColumn('{{%freeform_export_settings}}', 'setting', $this->longText());

        $this->alterColumn('{{%freeform_payments}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_feed_messages}}', 'conditions', $this->longText());

        $this->alterColumn('{{%freeform_session_context}}', 'propertyBag', $this->longText());
        $this->alterColumn('{{%freeform_session_context}}', 'attributeBag', $this->longText());

        $this->alterColumn('{{%freeform_saved_forms}}', 'payload', $this->longText());

        $this->alterColumn('{{%freeform_fields_type_groups}}', 'types', $this->longText());

        return true;
    }

    public function safeDown(): bool
    {
        $this->alterColumn('{{%freeform_forms}}', 'metadata', $this->json());

        $this->alterColumn('{{%freeform_forms_pages}}', 'metadata', $this->mediumText());

        $this->alterColumn('{{%freeform_forms_fields}}', 'metadata', $this->mediumText());

        $this->alterColumn('{{%freeform_forms_integrations}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_forms_notifications}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_favorite_fields}}', 'metadata', $this->mediumText());

        $this->alterColumn('{{%freeform_integrations}}', 'metadata', $this->longText());

        $this->alterColumn('{{%freeform_export_profiles}}', 'fields', $this->json());
        $this->alterColumn('{{%freeform_export_profiles}}', 'filters', $this->json());

        $this->alterColumn('{{%freeform_export_notifications}}', 'recipients', $this->json());

        $this->alterColumn('{{%freeform_export_settings}}', 'setting', $this->json());

        $this->alterColumn('{{%freeform_payments}}', 'metadata', $this->mediumText());

        $this->alterColumn('{{%freeform_feed_messages}}', 'conditions', $this->json());

        $this->alterColumn('{{%freeform_session_context}}', 'propertyBag', $this->json());
        $this->alterColumn('{{%freeform_session_context}}', 'attributeBag', $this->json());

        $this->alterColumn('{{%freeform_saved_forms}}', 'payload', $this->longText());

        $this->alterColumn('{{%freeform_fields_type_groups}}', 'types', $this->json());

        return false;
    }
}