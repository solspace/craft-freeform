<?php

namespace Solspace\Freeform\migrations;

use Solspace\Commons\Migrations\ForeignKey;
use Solspace\Commons\Migrations\StreamlinedInstallMigration;
use Solspace\Commons\Migrations\Table;

/**
 * Install migration.
 */
class Install extends StreamlinedInstallMigration
{
    /**
     * @return array
     */
    protected function defineTableData(): array
    {
        return [
            (new Table('freeform_forms'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(100)->notNull())
                ->addField('handle', $this->string(100)->notNull()->unique())
                ->addField('spamBlockCount', $this->integer()->unsigned()->notNull()->defaultValue(0))
                ->addField('submissionTitleFormat', $this->string(255)->notNull())
                ->addField('description', $this->text())
                ->addField('layoutJson', $this->mediumText())
                ->addField('returnUrl', $this->string(255))
                ->addField('defaultStatus', $this->integer()->unsigned())
                ->addField('formTemplateId', $this->integer()->unsigned())
                ->addField('color', $this->string(10))
                ->addField('optInDataStorageTargetHash', $this->string(20)->null()),

            (new Table('freeform_fields'))
                ->addField('id', $this->primaryKey())
                ->addField(
                    'type',
                    $this->enum(
                        'type',
                        [
                            'text',
                            'textarea',
                            'email',
                            'hidden',
                            'select',
                            'multiple_select',
                            'checkbox',
                            'checkbox_group',
                            'radio_group',
                            'file',
                            'dynamic_recipients',
                            'datetime',
                            'number',
                            'phone',
                            'website',
                            'rating',
                            'regex',
                            'confirmation',
                            'cc_details',
                        ]
                    )->notNull()
                )
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('label', $this->string(255))
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addField('instructions', $this->text())
                ->addField('metaProperties', $this->text()),

            (new Table('freeform_notifications'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('subject', $this->string(255)->notNull())
                ->addField('description', $this->text())
                ->addField('fromName', $this->string(255)->notNull())
                ->addField('fromEmail', $this->string(255)->notNull())
                ->addField('replyToEmail', $this->string(255))
                ->addField('bodyHtml', $this->text())
                ->addField('bodyText', $this->text())
                ->addField('includeAttachments', $this->boolean()->defaultValue(true))
                ->addField('sortOrder', $this->integer()),

            (new Table('freeform_integrations'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('type', $this->enum('type', ['mailing_list', 'crm', 'payment_gateway'])->notNull())
                ->addField('class', $this->string(255))
                ->addField('accessToken', $this->string(255))
                ->addField('settings', $this->text())
                ->addField('forceUpdate', $this->boolean()->defaultValue(false))
                ->addField('lastUpdate', $this->dateTime()),

            (new Table('freeform_mailing_lists'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('resourceId', $this->string(255)->notNull())
                ->addField('name', $this->string(255)->notNull())
                ->addField('memberCount', $this->integer())
                ->addIndex(['integrationId', 'resourceId'], true)
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE),

            (new Table('freeform_mailing_list_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('mailingListId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull())
                ->addField('type', $this->enum('type', ['string', 'numeric', 'boolean', 'array'])->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addForeignKey('mailingListId', 'freeform_mailing_lists', 'id', ForeignKey::CASCADE),

            (new Table('freeform_crm_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull())
                ->addField('type', $this->enum('type', ['string', 'numeric', 'boolean', 'array'])->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE),

            (new Table('freeform_payment_gateway_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull())
                ->addField('type', $this->enum('type', ['string', 'numeric', 'boolean', 'array'])->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE),

            (new Table('freeform_statuses'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('color', $this->string(30))
                ->addField('isDefault', $this->boolean())
                ->addField('sortOrder', $this->integer()),

            (new Table('freeform_unfinalized_files'))
                ->addField('id', $this->primaryKey())
                ->addField('assetId', $this->integer()->notNull()),

            (new Table('freeform_submissions'))
                ->addField('id', $this->primaryKey())
                ->addField('incrementalId', $this->integer()->notNull())
                ->addField('statusId', $this->integer())
                ->addField('formId', $this->integer()->notNull())
                ->addField('token', $this->string(100)->notNull())
                ->addField('ip', $this->string(46)->null())
                ->addField('isSpam', $this->boolean()->defaultValue(false))
                ->addIndex(['incrementalId'], true)
                ->addIndex(['token'], true)
                ->addForeignKey('id', 'elements', 'id', ForeignKey::CASCADE)
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE)
                ->addForeignKey('statusId', 'freeform_statuses', 'id', ForeignKey::CASCADE),

            (new Table('freeform_integrations_queue'))
                ->addField('id', $this->primaryKey())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('integrationType', $this->string(50)->notNull())
                ->addField('status', $this->string(50)->notNull())
                ->addField('fieldHash', $this->string(20))
                ->addIndex(['status'], true)
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE)
                ->addForeignKey('id', 'freeform_mailing_list_fields', 'id', ForeignKey::CASCADE)
        ];
    }
}
