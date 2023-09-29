<?php

namespace Solspace\Freeform\Bundles\Notifications\SendListeners;

use Solspace\Freeform\Bundles\Notifications\Providers\NotificationsProvider;
use Solspace\Freeform\Bundles\Rules\ConditionValidator;
use Solspace\Freeform\Events\Forms\SendNotificationsEvent;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\Bundles\FeatureBundle;
use Solspace\Freeform\Library\Rules\Types\NotificationRule;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use yii\base\Event;

class ConditionalNotifications extends FeatureBundle
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private ConditionValidator $conditionValidator,
    ) {
        Event::on(
            Form::class,
            Form::EVENT_SEND_NOTIFICATIONS,
            [$this, 'sendToRecipients']
        );
    }

    public static function isProOnly(): bool
    {
        return true;
    }

    public function sendToRecipients(SendNotificationsEvent $event): void
    {
        $form = $event->getForm();
        if ($form->isDisabled()->conditionalNotifications) {
            return;
        }

        $notifications = $this->notificationsProvider->getByFormAndClass($form, Conditional::class);

        $submission = $event->getSubmission();
        $fields = $event->getFields();

        foreach ($notifications as $notification) {
            $recipients = $notification->getRecipients();
            $template = $notification->getTemplate();

            $rule = $notification->getRule();
            if (!$rule) {
                continue;
            }

            $conditions = $rule->getConditions();

            $matchesSome = false;
            $matchesAll = true;
            foreach ($conditions as $condition) {
                $field = $form->get($condition->getField()->getId());
                $postedValue = $field?->getValue();

                $valueMatch = $this->conditionValidator->validate($condition, $postedValue);
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

            $event
                ->getMailer()
                ->sendEmail(
                    $form,
                    $recipients,
                    $fields,
                    $template,
                    $submission,
                )
            ;
        }
    }
}
