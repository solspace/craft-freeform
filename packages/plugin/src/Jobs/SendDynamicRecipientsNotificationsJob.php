<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Jobs;

use craft\queue\BaseJob;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;

class SendDynamicRecipientsNotificationsJob extends BaseJob implements NotificationJobInterface
{
    public ?int $submissionId = null;

    public function execute($queue): void
    {
        $freeform = Freeform::getInstance();

        $submission = $freeform->submissions->getSubmissionById($this->submissionId);
        if (!$submission) {
            return;
        }

        $form = $submission->getForm();
        $fields = $submission->getFieldCollection();

        $notificationsProvider = \Craft::$container->get(NotificationsProvider::class);
        $notifications = $notificationsProvider->getByFormAndClass($form, Dynamic::class);

        foreach ($notifications as $notification) {
            $field = $fields->get($notification->getField());
            if (!$field) {
                continue;
            }

            $value = $field->getValue();
            if (!\is_array($value)) {
                $value = [$value];
            }

            $defaultTemplate = $notification->getTemplate();
            $defaultRecipients = $notification->getRecipients();

            $recipientMapping = $notification->getRecipientMapping();
            foreach ($value as $selectedValue) {
                $mapping = $recipientMapping->getMappingByValue($selectedValue);

                $template = $defaultTemplate;
                $recipients = $defaultRecipients;
                if ($mapping) {
                    $template = $mapping->getTemplate() ?? $template;
                    $recipients = $mapping->getRecipients()->count() ? $mapping->getRecipients() : $recipients;
                }

                if (!$recipients->emailsToArray() || !$template) {
                    continue;
                }

                $freeform->mailer->sendEmail(
                    $form,
                    $recipients,
                    $fields,
                    $template,
                    $submission,
                );
            }
        }
    }

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Dynamic Recipients Notifications');
    }
}
