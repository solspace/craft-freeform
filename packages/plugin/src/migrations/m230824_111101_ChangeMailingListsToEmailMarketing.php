<?php

namespace Solspace\Freeform\migrations;

use craft\db\Migration;
use craft\db\Query;
use Solspace\Freeform\Library\Migrations\ForeignKey;

/**
 * m230824_111101_ChangeMailingListsToEmailMarketing migration.
 */
class m230824_111101_ChangeMailingListsToEmailMarketing extends Migration
{
    public function safeUp(): bool
    {
        $this->dropForeignKeyIfExists('{{%freeform_mailing_list_fields}}', ['mailingListId']);

        $this->renameTable('{{%freeform_mailing_lists}}', '{{%freeform_email_marketing_lists}}');
        $this->renameTable('{{%freeform_mailing_list_fields}}', '{{%freeform_email_marketing_fields}}');

        $this->addForeignKey(
            null,
            '{{%freeform_email_marketing_fields}}',
            ['mailingListId'],
            '{{%freeform_email_marketing_lists}}',
            ['id'],
            ForeignKey::CASCADE,
            ForeignKey::CASCADE
        );

        $mailingListIntegrations = (new Query())
            ->select(['id', 'class', 'type'])
            ->from('{{%freeform_integrations}}')
            ->where(['type' => 'mailing-lists'])
            ->orWhere(['type' => 'mailing-list'])
            ->indexBy('id')
            ->all()
        ;

        foreach ($mailingListIntegrations as $id => $integration) {
            $this->update(
                '{{%freeform_integrations}}',
                [
                    'type' => 'email-marketing',
                    'class' => str_replace(
                        'Solspace\Freeform\Integrations\MailingLists\\',
                        'Solspace\Freeform\Integrations\EmailMarketing\\',
                        $integration['class']
                    ),
                ],
                ['id' => $id]
            );
        }

        return true;
    }

    public function safeDown(): bool
    {
        $this->dropForeignKeyIfExists('{{%freeform_email_marketing_fields}}', ['mailingListId']);

        $this->renameTable('{{%freeform_email_marketing_lists}}', '{{%freeform_mailing_lists}}');
        $this->renameTable('{{%freeform_email_marketing_fields}}', '{{%freeform_mailing_list_fields}}');

        $this->addForeignKey(
            null,
            '{{%freeform_mailing_list_fields}}',
            ['mailingListId'],
            '{{%freeform_mailing_lists}}',
            ['id'],
            ForeignKey::CASCADE,
            ForeignKey::CASCADE
        );

        $mailingListIntegrations = (new Query())
            ->select(['id', 'class', 'type'])
            ->from('{{%freeform_integrations}}')
            ->where(['type' => 'email-marketing'])
            ->indexBy('id')
            ->all()
        ;

        foreach ($mailingListIntegrations as $id => $integration) {
            $this->update(
                '{{%freeform_integrations}}',
                [
                    'type' => 'mailing-lists',
                    'class' => str_replace(
                        'Solspace\Freeform\Integrations\EmailMarketing\\',
                        'Solspace\Freeform\Integrations\MailingLists\\',
                        $integration['class']
                    ),
                ],
                ['id' => $id]
            );
        }

        return true;
    }
}
