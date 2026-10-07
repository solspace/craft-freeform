<?php

namespace Solspace\Freeform\Library\Diagnostics;

use craft\db\Connection;
use craft\db\Query;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;
use Solspace\Freeform\Fields\Interfaces\RecipientInterface;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\DataObjects\NotificationTemplate;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\Conditional\Conditional;
use Solspace\Freeform\Notifications\Types\Dynamic\Dynamic;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField;

/**
 * Static configuration checks only: never renders Twig or sends a notification.
 */
class NotificationReadinessScan
{
    private \Closure $loadTemplate;

    public function __construct(private Connection $db, ?\Closure $loadTemplate = null)
    {
        $this->loadTemplate = $loadTemplate ?? $this->loadTemplate(...);
    }

    public function getTasks(): array
    {
        return (new Query())->select(['notification.*', 'form.name AS formName'])
            ->from('{{%freeform_forms_notifications}} notification')
            ->innerJoin('{{%freeform_forms}} form', '[[form.id]] = [[notification.formId]]')
            ->where(['notification.enabled' => true, 'form.dateArchived' => null])
            ->orderBy(['notification.id' => \SORT_ASC])->all($this->db)
        ;
    }

    public function scanTask(array $task, int $cursor = 0, ?int $maxId = null, int $offset = 0): array
    {
        $result = ['cursor' => 0, 'maxId' => null, 'offset' => 0, 'scanned' => 1, 'complete' => true, 'results' => []];

        try {
            $fields = (new Query())->select(['field.uid', 'field.type'])->from('{{%freeform_forms_fields}} field')
                ->innerJoin('{{%freeform_forms_rows}} row', '[[row.id]] = [[field.rowId]]')
                ->where(['field.formId' => $task['formId']])->indexBy('uid')->all($this->db)
            ;
            $ruleExists = $task['class'] !== Conditional::class || (new Query())
                ->select(['rule.id'])->from('{{%freeform_rules_notifications}} notificationRule')
                ->innerJoin('{{%freeform_rules}} rule', '[[rule.id]] = [[notificationRule.id]]')
                ->innerJoin('{{%freeform_forms_notifications}} owner', '[[owner.id]] = [[notificationRule.notificationId]]')
                ->where(['owner.formId' => $task['formId'], 'rule.uid' => $this->metadata($task)['rule'] ?? null])
                ->limit(1)->scalar($this->db)
            ;
            $result['results'] = $this->check($task, $fields, $ruleExists);
        } catch (\Throwable) {
            $result['results'][] = ['message' => 'The notification configuration could not be checked.', 'skipped' => true];
        }
        foreach ($result['results'] as &$issue) {
            $issue['context'] = ['form' => $task['formName'], 'notification' => (string) $task['id']];
        }

        return $result;
    }

    /** Check the saved configuration without constructing notification objects. */
    public function check(array $notification, array $fields, bool $ruleExists = true): array
    {
        $issues = [];
        $add = static function (string $message, bool $skipped = false) use (&$issues): void {
            $issues[] = ['message' => $message, 'skipped' => $skipped];
        };
        $class = $notification['class'];
        if (!\in_array($class, [Admin::class, Conditional::class, EmailField::class, Dynamic::class], true)) {
            $add('This custom notification type requires a manual configuration check.', true);

            return $issues;
        }
        $metadata = $this->metadata($notification);
        $templates = [$metadata['template'] ?? null];
        if (\in_array($class, [Admin::class, Conditional::class], true)) {
            $this->checkRecipients($metadata['recipients'] ?? [], $add, true);
        } elseif ($class === EmailField::class || $class === Dynamic::class) {
            $type = $fields[$metadata['field'] ?? '']['type'] ?? null;
            $interface = $class === EmailField::class ? RecipientInterface::class : OptionsInterface::class;
            if (!$type || !is_a($type, $interface, true)) {
                $add('The selected recipient field is missing or has an incompatible type.');
            }
            if ($class === Dynamic::class) {
                $recipients = $metadata['recipients'] ?? [];
                $mappings = $metadata['recipientMapping'] ?? [];
                if (!$recipients && !array_filter($mappings, static fn ($mapping) => !empty($mapping['recipients']))) {
                    $add('No recipients or recipient mappings are configured.');
                }
                $this->checkRecipients($recipients, $add, false);
                foreach ($mappings as $mapping) {
                    if (!empty($mapping['template'])) {
                        $templates[] = $mapping['template'];
                    }
                    $this->checkRecipients($mapping['recipients'] ?? [], $add, false);
                }
            }
        }
        if ($class === Conditional::class && (!$ruleExists || empty($metadata['rule']))) {
            $add('The selected notification rule no longer exists.');
        }
        foreach (array_unique($templates, \SORT_REGULAR) as $identifier) {
            if (null === $identifier || '' === $identifier) {
                $add('No notification template is selected.');

                continue;
            }
            $template = ($this->loadTemplate)($identifier);
            if (!$template) {
                $add('A selected notification template no longer exists.');

                continue;
            }
            if (!empty($template['unreadable'])) {
                $add('A selected notification template could not be read.', true);

                continue;
            }
            if ('' === trim($template['subject'] ?? '')) {
                $add('A selected notification template has no subject.');
            }
            if ('' === trim($template['fromName'] ?? '') || '' === trim($template['fromEmail'] ?? '')) {
                $add('A selected notification template is missing its sender name or email.');
            } elseif (!$this->isTemplate($template['fromEmail']) && !filter_var(trim($template['fromEmail']), \FILTER_VALIDATE_EMAIL)) {
                $add('A selected notification template has an invalid sender email.');
            }
        }

        return $issues;
    }

    private function metadata(array $notification): array
    {
        $metadata = json_decode($notification['metadata'], true, flags: \JSON_THROW_ON_ERROR);
        if (!\is_array($metadata)) {
            throw new \UnexpectedValueException('Invalid notification metadata.');
        }

        return $metadata;
    }

    private function checkRecipients(array $recipients, \Closure $add, bool $required): void
    {
        if ($required && !$recipients) {
            $add('No notification recipients are configured.');
        }
        foreach ($recipients as $recipient) {
            $email = trim($recipient['email'] ?? '');
            if (!$this->isTemplate($email) && !filter_var($email, \FILTER_VALIDATE_EMAIL)) {
                $add('A configured recipient email is empty or invalid.');
            }
        }
    }

    private function isTemplate(string $value): bool
    {
        return str_contains($value, '{{') || str_contains($value, '{%');
    }

    private function loadTemplate(int|string $identifier): array|false
    {
        if (is_numeric($identifier)) {
            return (new Query())->from('{{%freeform_notification_templates}}')->where(['id' => $identifier])->one($this->db);
        }

        // Use the same filename lookup as NotificationFilesService, but do not
        // instantiate a template: that can evaluate Twig in PDF attachment metadata.
        $settings = Freeform::getInstance()->settings->getSettingsModel();
        $directory = $settings->getAbsoluteEmailTemplateDirectory();
        if (!$directory || !is_readable($directory)) {
            return ['unreadable' => true];
        }
        foreach ($settings->listTemplatesInEmailTemplateDirectory() as $path => $name) {
            if ($name !== $identifier) {
                continue;
            }
            if (!is_readable($path)) {
                return ['unreadable' => true];
            }
            $content = file_get_contents($path);
            if (false === $content) {
                return ['unreadable' => true];
            }
            $template = [];
            foreach (['subject', 'fromName', 'fromEmail'] as $key) {
                preg_match(str_replace('__KEY__', $key, NotificationTemplate::METADATA_PATTERN), $content, $matches);
                $template[$key] = trim($matches[1] ?? '');
            }

            return $template;
        }

        return false;
    }
}
