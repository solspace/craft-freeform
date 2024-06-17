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
use Solspace\Freeform\Notifications\Types\Admin\Admin;

class SendAdminNotificationsJob extends BaseJob implements NotificationJobInterface
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
        $notifications = $notificationsProvider->getByFormAndClass($form, Admin::class);

        foreach ($notifications as $notification) {
            $recipients = $notification->getRecipients();
            if (!$recipients) {
                continue;
            }

            $template = $notification->getTemplate();
            if (!$template) {
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

    protected function defaultDescription(): ?string
    {
        return Freeform::t('Freeform: Processing Admin Notifications');
    }
}
