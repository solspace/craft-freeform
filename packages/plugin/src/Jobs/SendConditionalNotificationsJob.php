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
use Solspace\Freeform\Bundles\Rules\ConditionValidator;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;

class SendConditionalNotificationsJob extends BaseJob implements NotificationJobInterface
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

        $conditionValidator = new ConditionValidator();

        $notificationsProvider = \Craft::$container->get(NotificationsProvider::class);
        $notifications = $notificationsProvider->getByFormAndClass($form, Conditional::class);

        foreach ($notifications as $notification) {
            $recipients = $notification->getRecipients();
            if (!$recipients) {
                continue;
            }

            $template = $notification->getTemplate();
            if (!$template) {
                continue;
            }

            $rule = $notification->getRule();
            if (!$rule) {
                continue;
            }

            $conditions = $rule->getConditions();

            $matchesSome = false;
            $matchesAll = true;
            foreach ($conditions as $condition) {
                $field = $fields->get($condition->getField());
                if (!$field) {
                    continue;
                }

                $postedValue = $field->getValue();

                $valueMatch = $conditionValidator->validate($condition, $postedValue);
                if ($valueMatch) {
                    $matchesSome = true;
                } else {
                    $matchesAll = false;
                }
            }

            $shouldSend = $rule->isSend();

            $triggers = match ($rule->getCombinator()) {
                NotificationRule::COMBINATOR_AND => $shouldSend ? $matchesAll : !$matchesAll,
                NotificationRule::COMBINATOR_OR => $shouldSend ? $matchesSome : !$matchesSome,
            };

            if (!$triggers) {
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
        return Freeform::t('Freeform: Processing Conditional Notifications');
    }
}
