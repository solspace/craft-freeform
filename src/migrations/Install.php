<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;

/**
 * Install migration.
 */
class Install extends Migration
{
    /**
     * @inheritdoc
     */
    public function safeUp()
    {
        foreach ($this->getTableData() as $data) {
            $options               = $data['options'] ?? null;
            $fields                = $data['fields'];
            $fields['dateCreated'] = $this->dateTime()->notNull()->defaultExpression('NOW()');
            $fields['dateUpdated'] = $this
                    ->dateTime()
                    ->notNull()
                    ->defaultExpression('NOW()') . ' ON UPDATE CURRENT_TIMESTAMP';
            $fields['uid']         = $this->char(36)->defaultValue(0);

            $this->createTable($data['table'], $fields, $options);
        }

        $this->createIndex(
            'integrationId_resourceId_unq_idx',
            'freeform_mailing_lists',
            ['integrationId', 'resourceId'],
            true
        );

        $this->createIndex(
            'incrementalId',
            'freeform_submissions',
            ['incrementalId'],
            true
        );

        $this->addForeignKey(
            'crm_fields_integrationId',
            'freeform_crm_fields',
            'integrationId',
            'freeform_integrations',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'mailing_list_fields_mailingListId',
            'freeform_mailing_list_fields',
            'mailingListId',
            'freeform_mailing_lists',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'mailing_lists_integrationId',
            'freeform_mailing_lists',
            'integrationId',
            'freeform_integrations',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'submissions_id_fk',
            'freeform_submissions',
            'id',
            'elements',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'submissions_formId_fk',
            'freeform_submissions',
            'formId',
            'freeform_forms',
            'id',
            'CASCADE'
        );

        $this->addForeignKey(
            'submissions_statusId_fk',
            'freeform_submissions',
            'statusId',
            'freeform_statuses',
            'id',
            'SET NULL'
        );
    }

    /**
     * @inheritdoc
     */
    public function safeDown()
    {
        $this->dropForeignKey('crm_fields_integrationId', 'freeform_crm_fields');
        $this->dropForeignKey('mailing_list_fields_mailingListId', 'freeform_mailing_list_fields');
        $this->dropForeignKey('mailing_lists_integrationId', 'freeform_mailing_lists');
        $this->dropForeignKey('submissions_id_fk', 'freeform_submissions');
        $this->dropForeignKey('submissions_formId_fk', 'freeform_submissions');
        $this->dropForeignKey('submissions_statusId_fk', 'freeform_submissions');

        foreach ($this->getTableData() as $data) {
            $this->dropTableIfExists($data['table']);
        }
    }

    /**
     * @return array
     */
    private function getTableData(): array
    {
        return [
            [
                'table'  => 'freeform_forms',
                'fields' => [
                    'id'                    => $this->primaryKey(),
                    'name'                  => $this->string(100)->notNull(),
                    'handle'                => $this->string(100)->notNull()->unique(),
                    'spamBlockCount'        => $this->integer()->unsigned()->notNull()->defaultValue(0),
                    'submissionTitleFormat' => $this->string(255)->notNull(),
                    'description'           => $this->text(),
                    'layoutJson'            => $this->mediumText(),
                    'returnUrl'             => $this->string(255),
                    'defaultStatus'         => $this->integer()->unsigned(),
                    'formTemplateId'        => $this->integer()->unsigned(),
                    'color'                 => $this->string(10),
                ],
            ],
            [
                'table'  => 'freeform_fields',
                'fields' => [
                    'id'             => $this->primaryKey(),
                    'type'           => $this->enum(
                        'type',
                        [
                            'text',
                            'textarea',
                            'email',
                            'hidden',
                            'select',
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
                        ]
                    )->notNull(),
                    'handle'         => $this->string(255)->notNull()->unique(),
                    'label'          => $this->string(255),
                    'required'       => $this->boolean()->defaultValue(0),
                    'instructions'   => $this->text(),
                    'metaProperties' => $this->text(),
                ],
            ],
            [
                'table'  => 'freeform_notifications',
                'fields' => [
                    'id'                 => $this->primaryKey(),
                    'name'               => $this->string(255)->notNull(),
                    'handle'             => $this->string(255)->notNull()->unique(),
                    'subject'            => $this->string(255)->notNull(),
                    'description'        => $this->text(),
                    'fromName'           => $this->string(255)->notNull(),
                    'fromEmail'          => $this->string(255)->notNull(),
                    'replyToEmail'       => $this->string(255),
                    'bodyHtml'           => $this->text(),
                    'bodyText'           => $this->text(),
                    'includeAttachments' => $this->boolean()->defaultValue(true),
                    'sortOrder'          => $this->integer(),
                ],
            ],
            [
                'table'  => 'freeform_integrations',
                'fields' => [
                    'id'          => $this->primaryKey(),
                    'name'        => $this->string(255)->notNull(),
                    'handle'      => $this->string(255)->notNull()->unique(),
                    'type'        => $this->enum('type', ['mailing_list', 'crm'])->notNull(),
                    'class'       => $this->string(255),
                    'accessToken' => $this->string(255),
                    'settings'    => $this->text(),
                    'forceUpdate' => $this->boolean()->defaultValue(false),
                    'lastUpdate'  => $this->dateTime(),
                ],
            ],
            [
                'table'  => 'freeform_mailing_lists',
                'fields' => [
                    'id'            => $this->primaryKey(),
                    'integrationId' => $this->integer()->notNull(),
                    'resourceId'    => $this->string(255)->notNull(),
                    'name'          => $this->string(255)->notNull(),
                    'memberCount'   => $this->integer(),
                ],
            ],
            [
                'table'  => 'freeform_mailing_list_fields',
                'fields' => [
                    'id'            => $this->primaryKey(),
                    'mailingListId' => $this->integer()->notNull(),
                    'label'         => $this->string(255)->notNull(),
                    'handle'        => $this->string(255)->notNull(),
                    'type'          => $this->enum(
                        'type',
                        ['string', 'numeric', 'boolean', 'array']
                    )->notNull(),
                    'required'      => $this->boolean()->defaultValue(false),
                ],
            ],
            [
                'table'  => 'freeform_crm_fields',
                'fields' => [
                    'id'            => $this->primaryKey(),
                    'integrationId' => $this->integer()->notNull(),
                    'label'         => $this->string(255)->notNull(),
                    'handle'        => $this->string(255)->notNull(),
                    'type'          => $this->enum(
                        'type',
                        ['string', 'numeric', 'boolean', 'array']
                    )->notNull(),
                    'required'      => $this->boolean()->defaultValue(false),
                ],
            ],
            [
                'table'  => 'freeform_statuses',
                'fields' => [
                    'id'        => $this->primaryKey(),
                    'name'      => $this->string(255)->notNull(),
                    'handle'    => $this->string(255)->notNull()->unique(),
                    'color'     => $this->string(30),
                    'isDefault' => $this->boolean(),
                    'sortOrder' => $this->integer(),
                ],
            ],
            [
                'table'  => 'freeform_unfinalized_files',
                'fields' => [
                    'id'      => $this->primaryKey(),
                    'assetId' => $this->integer()->notNull(),
                ],
            ],
            [
                'table'  => 'freeform_submissions',
                'fields' => [
                    'id'            => $this->primaryKey(),
                    'incrementalId' => $this->integer()->notNull(),
                    'statusId'      => $this->integer(),
                    'formId'        => $this->integer()->notNull(),
                ],
            ],
        ];
    }
}
