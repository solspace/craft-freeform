<?php

namespace Solspace\Freeform\Bundles\Notifications\Providers;

use Solspace\Freeform\Bundles\Rules\RuleValidator;
use Solspace\Freeform\Bundles\Rules\Types\NotificationRuleValidator;
use Solspace\Freeform\Events\Notifications\PrepareNotificationEvent;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Library\Helpers\IsolatedTwig;
use Solspace\Freeform\Library\Helpers\StringHelper;
use Solspace\Freeform\Notifications\Components\Recipients\RecipientCollection;
use Solspace\Freeform\Notifications\NotificationInterface;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;
use Twig\Error\Error;
use yii\base\Event;

class AdditionalNotificationRecipientsProvider
{
    public function __construct(
        private NotificationsProvider $notificationsProvider,
        private NotificationRuleValidator $ruleValidator,
        private IsolatedTwig $twig,
        private RuleValidator $fieldRuleValidator,
    ) {}

    /**
     * The form must first be populated with this submission's values.
     *
     * @return array<string, array{email: string, sources: array<array{label: string, type: string}>, configuredCount: int, configuredTemplates: string[]}>
     */
    public function getChoices(Form $form): array
    {
        $choices = [];
        $fields = $form->getLayout()->getFields();
        $variables = $this->getVariables($form);
        foreach ($fields as $field) {
            if ($field instanceof RecipientInterface) {
                $this->addChoices($choices, $field->getRecipients(), $field->getLabel(), sourceType: 'field');
            }
        }

        foreach ($this->getConfigurations($form) as $configuration) {
            $keys = $this->addChoices($choices, $configuration['recipients'], $configuration['notification']->getName(), $variables);
            if ($configuration['template']) {
                $templateName = $configuration['template']->getName();
                $formPrefix = $form->getName().' - ';
                if (str_starts_with($templateName, $formPrefix)) {
                    $templateName = substr($templateName, \strlen($formPrefix));
                }
                foreach ($keys as $key) {
                    ++$choices[$key]['configuredCount'];
                    $choices[$key]['configuredTemplates'][] = $templateName;
                    $choices[$key]['configuredTemplates'] = array_values(array_unique($choices[$key]['configuredTemplates']));
                }
            }
        }

        return $choices;
    }

    /** @return array<array{recipients: RecipientCollection, template: NotificationTemplate, notification: NotificationInterface}> */
    public function getSelectedConfiguredNotifications(Form $form, array $selectedEmails): array
    {
        if (!$selectedEmails) {
            return [];
        }

        $selected = array_fill_keys(array_map(static fn (string $email) => strtolower(trim($email)), $selectedEmails), true);
        $variables = $this->getVariables($form);
        $notifications = [];
        foreach ($this->getConfigurations($form) as $configuration) {
            $choices = [];
            $this->addChoices($choices, $configuration['recipients'], '', $variables);
            if (!array_intersect_key($choices, $selected)) {
                continue;
            }

            $event = new PrepareNotificationEvent($form, $configuration['notification'], $configuration['recipients'], $configuration['template']);
            Event::trigger($configuration['notification'], NotificationInterface::PREPARE_NOTIFICATION, $event);
            $template = $event->getTemplate();
            if (!$template) {
                continue;
            }

            $choices = [];
            $this->addChoices($choices, $event->getRecipients(), '', $variables);
            $emails = array_column(array_intersect_key($choices, $selected), 'email');
            if ($emails) {
                $notifications[] = [
                    'recipients' => RecipientCollection::fromArray($emails),
                    'template' => $template,
                    'notification' => $configuration['notification'],
                ];
            }
        }

        return $notifications;
    }

    public function getSelectedRecipients(Form $form, array $selectedEmails, array $additionalEmails): RecipientCollection
    {
        // Resolve against each submission again: a checkbox must never turn into
        // a global recipient for other submissions in the bulk action.
        $choices = $selectedEmails ? $this->getChoices($form) : [];
        $emails = [];
        foreach ($additionalEmails as $email) {
            $emails[strtolower(trim($email))] = trim($email);
        }
        foreach ($selectedEmails as $email) {
            $key = strtolower(trim($email));
            if (isset($choices[$key])) {
                $emails[$key] = $choices[$key]['email'];
            }
        }

        return RecipientCollection::fromArray(array_values($emails));
    }

    /**
     * Resolve every enabled notification for the current submission, including
     * per-option templates. Keep notification identity for mailer event hooks.
     *
     * @return array<array{recipients: RecipientCollection, template: ?NotificationTemplate, notification: NotificationInterface}>
     */
    private function getConfigurations(Form $form): array
    {
        $configurations = [];
        foreach ($this->notificationsProvider->getByForm($form) as $notification) {
            if (!$notification->isEnabled()) {
                continue;
            }

            if ($notification instanceof Admin && !$form->isDisabled()->adminNotifications) {
                $pairs = [[$notification->getRecipients(), $notification->getTemplate()]];
            } elseif ($notification instanceof Conditional && !$form->isDisabled()->conditionalNotifications) {
                if (!$this->ruleValidator->isPassing($notification, $form)) {
                    continue;
                }
                $pairs = [[$notification->getRecipients(), $notification->getTemplate()]];
            } elseif ($notification instanceof EmailField && !$form->isDisabled()->emailFieldNotifications) {
                $field = $form->get($notification->getField());
                if (!$field || $this->fieldRuleValidator->isFieldHidden($form, $field) || !$field->getValue()) {
                    continue;
                }
                $pairs = [[RecipientCollection::fromArray([$field->getValue()]), $notification->getTemplate()]];
            } elseif ($notification instanceof Dynamic && !$form->isDisabled()->userSelectNotifications) {
                $field = $form->get($notification->getField());
                if (!$field) {
                    continue;
                }

                $pairs = [];
                foreach ((array) $field->getValue() as $value) {
                    $recipients = $notification->getRecipients();
                    $mapping = $notification->getRecipientMapping()?->getMappingByValue($value);
                    if ($mapping && $mapping->getRecipients()->count()) {
                        $recipients = $mapping->getRecipients();
                    }
                    if (!$recipients->count() && \is_string($value) && filter_var($value, \FILTER_VALIDATE_EMAIL)) {
                        $recipients = RecipientCollection::fromArray([$value]);
                    }
                    $pairs[] = [$recipients, $mapping?->getTemplate() ?? $notification->getTemplate()];
                }
            } else {
                continue;
            }

            foreach ($pairs as [$recipients, $template]) {
                $configurations[] = ['recipients' => $recipients, 'template' => $template, 'notification' => $notification];
            }
        }

        return $configurations;
    }

    private function getVariables(Form $form): array
    {
        $variables = ['form' => $form, 'allFields' => $form->getLayout()->getFields()];
        foreach ($form->getLayout()->getFields() as $field) {
            $variables[$field->getHandle()] = $field;
        }

        return $variables;
    }

    private function addChoices(array &$choices, RecipientCollection $recipients, string $source, array $variables = [], string $sourceType = 'notification'): array
    {
        $keys = [];
        $sourceDetail = ['label' => $source, 'type' => $sourceType];
        foreach ($recipients as $recipient) {
            $email = $recipient->getEmail();
            if ($recipient->isTemplate() && $variables) {
                try {
                    $email = $this->twig->render($email, $variables);
                } catch (Error) {
                    // An invalid configured template should not prevent manual sending.
                    continue;
                }
            }

            foreach (StringHelper::extractSeparatedValues($email) as $address) {
                if (!filter_var($address, \FILTER_VALIDATE_EMAIL)) {
                    continue;
                }

                $key = strtolower($address);
                $keys[$key] = $key;
                $choices[$key] ??= ['email' => $address, 'sources' => [], 'configuredCount' => 0, 'configuredTemplates' => []];
                if (!\in_array($sourceDetail, $choices[$key]['sources'], true)) {
                    $choices[$key]['sources'][] = $sourceDetail;
                }
            }
        }

        return array_values($keys);
    }
}
