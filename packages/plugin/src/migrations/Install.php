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
    protected function defineTableData(): array
    {
        return [
            (new Table('freeform_forms'))
                ->addField('id', $this->primaryKey())
                ->addField('type', $this->string(200)->notNull())
                ->addField('name', $this->string(100)->notNull())
                ->addField('handle', $this->string(100)->notNull()->unique())
                ->addField('spamBlockCount', $this->integer()->unsigned()->notNull()->defaultValue(0))
                ->addField('submissionTitleFormat', $this->string(255)->notNull())
                ->addField('description', $this->text())
                ->addField('layoutJson', $this->mediumText())
                ->addField('metadata', $this->mediumText())
                ->addField('returnUrl', $this->string(255))
                ->addField('defaultStatus', $this->integer()->unsigned())
                ->addField('formTemplateId', $this->integer()->unsigned())
                ->addField('color', $this->string(10))
                ->addField('optInDataStorageTargetHash', $this->string(20)->null())
                ->addField('limitFormSubmissions', $this->string(20)->null())
                ->addField('extraPostUrl', $this->string(255)->null())
                ->addField('extraPostTriggerPhrase', $this->string(255)->null())
                ->addField('order', $this->integer())
                ->addField('gtmEnabled', $this->boolean()->defaultValue(false))
                ->addField('gtmId', $this->string()->null())
                ->addField('gtmEventName', $this->string()->null()),

            (new Table('freeform_forms_layouts'))
                ->addField('id', $this->primaryKey())
                ->addField('formId', $this->integer()->notNull())
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE),

            (new Table('freeform_forms_pages'))
                ->addField('id', $this->primaryKey())
                ->addField('formId', $this->integer()->notNull())
                ->addField('layoutId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(200)->notNull())
                ->addField('order', $this->integer()->notNull())
                ->addIndex(['formId', 'order'])
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE)
                ->addForeignKey('layoutId', 'freeform_forms_layout', 'id', ForeignKey::CASCADE),

            (new Table('freeform_forms_rows'))
                ->addField('id', $this->primaryKey())
                ->addField('layoutId', $this->integer()->notNull())
                ->addField('order', $this->integer())
                ->addIndex(['layoutId', 'order'])
                ->addForeignKey('layoutId', 'freeform_forms_layouts', 'id', ForeignKey::CASCADE),

            (new Table('freeform_forms_cells'))
                ->addField('id', $this->primaryKey())
                ->addField('rowId', $this->integer()->notNull())
                ->addField('order', $this->integer())
                ->addField('type', $this->string(255)->notNull())
                ->addField('metadata', $this->mediumText())
                ->addIndex(['rowId', 'order'])
                ->addForeignKey('rowId', 'freeform_forms_rows', 'id', ForeignKey::CASCADE),

            (new Table('freeform_forms_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('formId', $this->integer()->notNull())
                ->addField('cellId', $this->integer()->notNull())
                ->addField('type', $this->string(255)->notNull())
                ->addField('metadata', $this->mediumText())
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE)
                ->addForeignKey('cellId', 'freeform_forms_cells', 'id', ForeignKey::CASCADE),

            (new Table('freeform_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('type', $this->string(50)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('label', $this->string(255))
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addField('instructions', $this->text())
                ->addField('metaProperties', $this->text())
                ->addIndex(['type']),

            (new Table('freeform_notifications'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('subject', $this->string(255)->notNull())
                ->addField('description', $this->text())
                ->addField('fromName', $this->string(255)->notNull())
                ->addField('fromEmail', $this->string(255)->notNull())
                ->addField('replyToName', $this->string(255))
                ->addField('replyToEmail', $this->string(255))
                ->addField('cc', $this->string(255))
                ->addField('bcc', $this->string(255))
                ->addField('bodyHtml', $this->text())
                ->addField('bodyText', $this->text())
                ->addField('autoText', $this->boolean()->notNull()->defaultValue(true))
                ->addField('includeAttachments', $this->boolean()->defaultValue(true))
                ->addField('presetAssets', $this->string(255))
                ->addField('sortOrder', $this->integer()),

            (new Table('freeform_integrations'))
                ->addField('id', $this->primaryKey())
                ->addField('name', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull()->unique())
                ->addField('type', $this->string(50)->notNull())
                ->addField('class', $this->string(255))
                ->addField('accessToken', $this->text())
                ->addField('settings', $this->text())
                ->addField('forceUpdate', $this->boolean()->defaultValue(false))
                ->addField('lastUpdate', $this->dateTime())
                ->addIndex(['type']),

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
                ->addField('type', $this->string(50)->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addIndex(['type'])
                ->addForeignKey('mailingListId', 'freeform_mailing_lists', 'id', ForeignKey::CASCADE),

            (new Table('freeform_crm_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull())
                ->addField('type', $this->string(50)->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addIndex(['type'])
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE),

            (new Table('freeform_payment_gateway_fields'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('label', $this->string(255)->notNull())
                ->addField('handle', $this->string(255)->notNull())
                ->addField('type', $this->string(50)->notNull())
                ->addField('required', $this->boolean()->defaultValue(false))
                ->addIndex(['type'])
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
                ->addField('assetId', $this->integer()->notNull())
                ->addField('fieldHandle', $this->string(255))
                ->addField('formToken', $this->string(255))
                ->addIndex(['fieldHandle', 'formToken']),

            (new Table('freeform_submissions'))
                ->addField('id', $this->primaryKey())
                ->addField('incrementalId', $this->integer()->notNull())
                ->addField('userId', $this->integer())
                ->addField('statusId', $this->integer())
                ->addField('formId', $this->integer()->notNull())
                ->addField('token', $this->string(100)->notNull())
                ->addField('ip', $this->string(46)->null())
                ->addField('isSpam', $this->boolean()->defaultValue(false))
                ->addIndex(['incrementalId'], true)
                ->addIndex(['token'], true)
                ->addForeignKey('id', 'elements', 'id', ForeignKey::CASCADE)
                ->addForeignKey('userId', 'users', 'id', ForeignKey::CASCADE)
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE)
                ->addForeignKey('statusId', 'freeform_statuses', 'id', ForeignKey::CASCADE),

            (new Table('freeform_integrations_queue'))
                ->addField('id', $this->primaryKey())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('integrationType', $this->string(50)->notNull())
                ->addField('status', $this->string(50)->notNull())
                ->addField('fieldHash', $this->string(20))
                ->addIndex(['status'], false)
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE)
                ->addForeignKey('id', 'freeform_mailing_list_fields', 'id', ForeignKey::CASCADE),

            // Pro
            (new Table('freeform_export_profiles'))
                ->addField('id', $this->primaryKey())
                ->addField('formId', $this->integer()->notNull())
                ->addField('name', $this->string(255)->notNull()->unique())
                ->addField('limit', $this->integer())
                ->addField('dateRange', $this->string(255))
                ->addField('rangeStart', $this->string(255)->null())
                ->addField('rangeEnd', $this->string(255)->null())
                ->addField('fields', $this->text()->notNull())
                ->addField('filters', $this->text())
                ->addField('statuses', $this->text()->notNull())
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE),

            (new Table('freeform_export_notifications'))
                ->addField('id', $this->primaryKey())
                ->addField('profileId', $this->integer()->notNull())
                ->addField('name', $this->string(255)->notNull()->unique())
                ->addField('fileType', $this->string(30)->notNull())
                ->addField('fileName', $this->string(255))
                ->addField('frequency', $this->string(20)->notNull())
                ->addField('recipients', $this->text()->notNull())
                ->addField('subject', $this->string(255))
                ->addField('message', $this->text())
                ->addForeignKey('profileId', 'freeform_export_profiles', 'id', ForeignKey::CASCADE),

            (new Table('freeform_export_settings'))
                ->addField('id', $this->primaryKey())
                ->addField('userId', $this->integer()->notNull())
                ->addField('setting', $this->mediumText())
                ->addForeignKey('userId', 'users', 'id', ForeignKey::CASCADE),

            // Payments
            (new Table('freeform_payments_subscription_plans'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('resourceId', $this->string(255))
                ->addField('name', $this->string(255))
                ->addField('status', $this->string(20))
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE),

            (new Table('freeform_payments_payments'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('subscriptionId', $this->integer())
                ->addField('resourceId', $this->string(50))
                ->addField('amount', $this->float(2))
                ->addField('currency', $this->string(3))
                ->addField('last4', $this->smallInteger())
                ->addField('status', $this->string(20))
                ->addField('metadata', $this->mediumText())
                ->addField('errorCode', $this->string(20))
                ->addField('errorMessage', $this->string(255))
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE)
                ->addForeignKey('subscriptionId', 'freeform_payments_subscriptions', 'id', ForeignKey::CASCADE)
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE)
                ->addIndex(['integrationId', 'resourceId'], true),

            (new Table('freeform_payments_subscriptions'))
                ->addField('id', $this->primaryKey())
                ->addField('integrationId', $this->integer()->notNull())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('planId', $this->integer()->notNull())
                ->addField('resourceId', $this->string(50))
                ->addField('amount', $this->float(2))
                ->addField('currency', $this->string(3))
                ->addField('interval', $this->string(20))
                ->addField('intervalCount', $this->smallInteger()->null())
                ->addField('last4', $this->smallInteger())
                ->addField('status', $this->string(20))
                ->addField('metadata', $this->mediumText())
                ->addField('errorCode', $this->string(20))
                ->addField('errorMessage', $this->string(255))
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE)
                ->addForeignKey('integrationId', 'freeform_integrations', 'id', ForeignKey::CASCADE)
                ->addForeignKey('planId', 'freeform_payments_subscription_plans', 'id', ForeignKey::CASCADE)
                ->addIndex(['integrationId', 'resourceId'], true),

            (new Table('freeform_webhooks'))
                ->addField('id', $this->primaryKey())
                ->addField('type', $this->string()->notNull())
                ->addField('name', $this->string()->notNull())
                ->addField('webhook', $this->string()->notNull())
                ->addField('settings', $this->text())
                ->addIndex(['type']),

            (new Table('freeform_webhooks_form_relations'))
                ->addField('id', $this->primaryKey())
                ->addField('webhookId', $this->integer()->notNull())
                ->addField('formId', $this->integer()->notNull())
                ->addIndex(['webhookId'])
                ->addIndex(['formId'])
                ->addForeignKey('webhookId', 'freeform_webhooks', 'id', ForeignKey::CASCADE)
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE),

            (new Table('freeform_submission_notes'))
                ->addField('id', $this->primaryKey())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('note', $this->text())
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE),

            (new Table('freeform_spam_reason'))
                ->addField('id', $this->primaryKey())
                ->addField('submissionId', $this->integer()->notNull())
                ->addField('reasonType', $this->string(100)->notNull())
                ->addField('reasonMessage', $this->text())
                ->addIndex(['submissionId', 'reasonType'])
                ->addForeignKey('submissionId', 'freeform_submissions', 'id', ForeignKey::CASCADE),

            (new Table('freeform_feeds'))
                ->addField('id', $this->primaryKey())
                ->addField('hash', $this->string()->notNull())
                ->addField('min', $this->string())
                ->addField('max', $this->string())
                ->addField('issueDate', $this->dateTime()->notNull())
                ->addIndex(['hash'], true),

            (new Table('freeform_feed_messages'))
                ->addField('id', $this->primaryKey())
                ->addField('feedId', $this->integer()->notNull())
                ->addField('message', $this->text()->notNull())
                ->addField('conditions', $this->text()->notNull())
                ->addField('type', $this->string()->notNull())
                ->addField('seen', $this->boolean()->notNull()->defaultValue(false))
                ->addField('issueDate', $this->dateTime()->notNull())
                ->addForeignKey('feedId', 'freeform_feeds', 'id', ForeignKey::CASCADE),

            (new Table('freeform_lock'))
                ->addField('id', $this->primaryKey())
                ->addField('key', $this->string()->notNull())
                ->addIndex(['key', 'dateCreated'])
                ->addIndex(['dateCreated']),

            (new Table('freeform_notification_log'))
                ->addField('id', $this->primaryKey())
                ->addField('type', $this->string(30)->notNull())
                ->addField('name', $this->string())
                ->addIndex(['type', 'dateCreated']),

            (new Table('freeform_session_context'))
                ->addField('id', $this->primaryKey())
                ->addField('contextKey', $this->string(100)->notNull())
                ->addField('sessionId', $this->string(100)->notNull())
                ->addField('formId', $this->integer()->notNull())
                ->addField('propertyBag', $this->mediumText())
                ->addField('attributeBag', $this->mediumText())
                ->addIndex(['contextKey', 'formId'])
                ->addIndex(['sessionId'])
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE),

            (new Table('freeform_saved_forms'))
                ->addField('id', $this->primaryKey())
                ->addField('sessionId', $this->string(100))
                ->addField('formId', $this->integer()->notNull())
                ->addField('token', $this->string(100)->notNull())
                ->addField('payload', $this->mediumText())
                ->addIndex(['token'])
                ->addIndex(['dateCreated'])
                ->addIndex(['sessionId'])
                ->addForeignKey('formId', 'freeform_forms', 'id', ForeignKey::CASCADE),
        ];
    }
}
