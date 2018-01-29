<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

class m180125_124339_UpdateForeignKeyNames extends Migration
{
    /**
     * @return bool|void
     */
    public function safeUp()
    {
        try {
            $this->dropForeignKey('crm_fields_integrationId', '{{%freeform_crm_fields}}');
            $this->dropForeignKey('mailing_list_fields_mailingListId', '{{%freeform_mailing_list_fields}}');
            $this->dropForeignKey('mailing_lists_integrationId', '{{%freeform_mailing_lists}}');
            $this->dropForeignKey('submissions_id_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey('submissions_formId_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey('submissions_statusId_fk', '{{%freeform_submissions}}');

            $this->addForeignKey(
                'freeform_crm_fields_integrationId_fk',
                '{{%freeform_crm_fields}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'freeform_mailing_list_fields_mailingListId_fk',
                '{{%freeform_mailing_list_fields}}',
                'mailingListId',
                '{{%freeform_mailing_lists}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'freeform_mailing_lists_integrationId_fk',
                '{{%freeform_mailing_lists}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'freeform_submissions_id_fk',
                '{{%freeform_submissions}}',
                'id',
                '{{%elements}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'freeform_submissions_formId_fk',
                '{{%freeform_submissions}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'freeform_submissions_statusId_fk',
                '{{%freeform_submissions}}',
                'statusId',
                '{{%freeform_statuses}}',
                'id',
                'CASCADE'
            );
        } catch (\Exception $e) {
        }
    }

    /**
     * @return bool|void
     */
    public function safeDown()
    {
        try {
            $this->dropForeignKey('freeform_crm_fields_integrationId_fk', '{{%freeform_crm_fields}}');
            $this->dropForeignKey('freeform_mailing_list_fields_mailingListId_fk', '{{%freeform_mailing_list_fields}}');
            $this->dropForeignKey('freeform_mailing_lists_integrationId_fk', '{{%freeform_mailing_lists}}');
            $this->dropForeignKey('freeform_submissions_id_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey('freeform_submissions_formId_fk', '{{%freeform_submissions}}');
            $this->dropForeignKey('freeform_submissions_statusId_fk', '{{%freeform_submissions}}');

            $this->addForeignKey(
                'crm_fields_integrationId',
                '{{%freeform_crm_fields}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'mailing_list_fields_mailingListId',
                '{{%freeform_mailing_list_fields}}',
                'mailingListId',
                '{{%freeform_mailing_lists}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'mailing_lists_integrationId',
                '{{%freeform_mailing_lists}}',
                'integrationId',
                '{{%freeform_integrations}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_id_fk',
                '{{%freeform_submissions}}',
                'id',
                '{{%elements}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_formId_fk',
                '{{%freeform_submissions}}',
                'formId',
                '{{%freeform_forms}}',
                'id',
                'CASCADE'
            );
            $this->addForeignKey(
                'submissions_statusId_fk',
                '{{%freeform_submissions}}',
                'statusId',
                '{{%freeform_statuses}}',
                'id',
                'CASCADE'
            );
        } catch (\Exception $e) {
        }
    }
}
