<?php

namespace Solspace\Freeform\Bundles\Mcp;

use craft\helpers\StringHelper;
use craft\mcp\attributes\RequiresPermission;
use Mcp\Capability\Attribute\McpTool;
use Mcp\Capability\Attribute\Schema;
use Mcp\Exception\ToolCallException;
use Mcp\Schema\ToolAnnotations;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUserChecker;
use Solspace\Freeform\Bundles\Notifications\Providers\NotificationTemplateProvider;
use Solspace\Freeform\Fields\Implementations\EmailField;
use Solspace\Freeform\Fields\Interfaces\NoEmailPresenceInterface;
use Solspace\Freeform\Form\Form;
use Solspace\Freeform\Form\Settings\Implementations\BehaviorSettings;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\JsonHelper;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Library\Helpers\SitesHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Notifications\Types\Admin\Admin;
use Solspace\Freeform\Notifications\Types\EmailField\EmailField as EmailNotification;
use Solspace\Freeform\Records\Form\FormNotificationRecord;
use Solspace\Freeform\Records\FormRecord;
use Solspace\Freeform\Records\NotificationTemplateRecord;
use Solspace\Freeform\Records\Rules\FieldRuleRecord;
use Solspace\Freeform\Services\FormWizardNotificationService;

final class WorkflowTools
{
    private const PLACEHOLDER = '/\{([a-zA-Z][a-zA-Z0-9_]*)\}/';

    #[McpTool(name: 'freeform.forms.audit', description: 'Audit a form before launch. Reports required fields, broken field rules, translation gaps, notification configuration and after-submit behavior.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function audit(string $form, string $site): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site): array {
            $site = Access::site($site);
            $target = Access::form($form, $site);
            $checks = [];
            $requiredFields = [];
            $positions = [];
            foreach ($target->getPages() as $pageNumber => $page) {
                if (!$page->getFields()->count()) {
                    $checks[] = ['check' => 'emptyPage', 'page' => $page->getLabel()];
                }
                foreach ($page->getFields() as $field) {
                    $positions[$field->getId()] = $pageNumber;
                    if ($field->isRequired()) {
                        $requiredFields[] = $field->getHandle();
                    }
                }
            }
            foreach (FieldRuleRecord::getExistingRules($target->getId()) as $link) {
                $conditions = $link->rule->conditions;
                foreach ($conditions as $condition) {
                    if (!isset($positions[$condition->fieldId], $positions[$link->fieldId])
                        || $positions[$condition->fieldId] > $positions[$link->fieldId] || (int) $condition->fieldId === (int) $link->fieldId) {
                        $checks[] = ['check' => 'brokenFieldRule', 'rule' => $link->rule->uid];

                        break;
                    }
                }
                if (!$conditions) {
                    $checks[] = ['check' => 'fieldRuleHasNoConditions', 'rule' => $link->rule->uid];
                }
            }

            $translations = null;
            if (SitesHelper::isEnabled() && Freeform::getInstance()->translations->isTranslationsEnabled($target)) {
                $primary = \Craft::$app->getSites()->getPrimarySite();
                if ($primary->language !== $site->language) {
                    $translations = TranslationTools::missingCount($target, (int) $site->id);
                    if ($translations) {
                        $checks[] = ['check' => 'missingTranslations', 'count' => $translations];
                    }
                }
            }

            $notificationCount = null;
            if (PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS)
                && \Craft::$container->get(LimitedUserChecker::class)->can('notifications.tab')) {
                $provider = \Craft::$container->get(NotificationTemplateProvider::class);
                $notifications = FormNotificationRecord::findAll(['formId' => $target->getId(), 'enabled' => true]);
                $notificationCount = \count($notifications);
                foreach ($notifications as $notification) {
                    $metadata = JsonHelper::decode($notification->metadata);
                    $template = $metadata->template ?? null;
                    if ((!\is_string($template) && !\is_int($template)) || !$provider->getNotificationTemplate($template)) {
                        $checks[] = ['check' => 'notificationTemplateMissing', 'notification' => $notification->uid];
                    }
                    $invalidRecipients = match ($notification->class) {
                        Admin::class => !array_filter((array) ($metadata->recipients ?? []), static fn ($recipient) => filter_var($recipient->email ?? '', \FILTER_VALIDATE_EMAIL)),
                        EmailNotification::class => !$target->getLayout()->getFields()->get($metadata->field ?? '') instanceof EmailField,
                        default => false,
                    };
                    if ($invalidRecipients) {
                        $checks[] = ['check' => 'notificationRecipientsMissing', 'notification' => $notification->uid];
                    }
                }
            }

            $success = self::success($target);
            if (BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL === $success['behavior'] && '' === $success['returnUrl']) {
                $checks[] = ['check' => 'missingReturnUrl'];
            }

            return [
                'form' => $target->getHandle(),
                'site' => $site->handle,
                'requiredFields' => $requiredFields,
                'missingTranslations' => $translations,
                'enabledNotifications' => $notificationCount,
                'afterSubmit' => $success,
                'findings' => $checks,
            ];
        });
    }

    /**
     * @param null|string $redirectUrl Set a site-relative or HTTPS redirect. Supply an empty string to switch to reload.
     */
    #[McpTool(name: 'freeform.forms.update-success', description: 'Update the success message or redirect after a successful submission.', annotations: new ToolAnnotations(destructiveHint: false, idempotentHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function updateSuccess(string $form, string $site, ?string $message = null, ?string $redirectUrl = null): array
    {
        return Access::editForm($form, $site, static function (Form $target) use ($message, $redirectUrl): array {
            Access::requireEditorOption('settings.tab.success-and-errors');
            if (null === $message && null === $redirectUrl) {
                throw new ToolCallException('Supply a success message or a redirect URL.');
            }
            $record = FormRecord::findOne($target->getId());
            if (!$record) {
                throw new ToolCallException('The form is no longer available.');
            }
            $metadata = JsonHelper::decode($record->metadata) ?: new \stdClass();
            $metadata->behavior ??= new \stdClass();
            if (null !== $message) {
                $metadata->behavior->successMessage = Access::text($message, 1000, true);
            }
            if (null !== $redirectUrl) {
                $url = Access::text($redirectUrl, 2048);
                if ('' !== $url && !self::validRedirect($url)) {
                    throw new ToolCallException('Use a site-relative path or an HTTPS URL without credentials.');
                }
                $metadata->behavior->returnUrl = $url;
                $metadata->behavior->successBehavior = '' === $url ? BehaviorSettings::SUCCESS_BEHAVIOR_RELOAD : BehaviorSettings::SUCCESS_BEHAVIOR_REDIRECT_RETURN_URL;
            }
            $record->replaceSettingsMetadata(json_encode($metadata, \JSON_THROW_ON_ERROR));
            if (!$record->save(false, ['metadata'])) {
                throw new ToolCallException('The success settings could not be saved.');
            }

            return ['form' => $target->getHandle(), 'updated' => array_filter(compact('message', 'redirectUrl'), static fn ($value) => null !== $value)];
        });
    }

    /**
     * @param array<string, string> $sample Synthetic values keyed by field handle. Never use respondent data here.
     */
    #[McpTool(name: 'freeform.notifications.preview', description: 'Preview a plain-text Freeform notification draft with synthetic field values and the current success behavior. Sends no email.', annotations: new ToolAnnotations(readOnlyHint: true))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function previewNotification(string $form, string $site, string $subject, string $body, ?string $recipient = null, ?string $emailField = null, #[Schema(type: 'object', additionalProperties: ['type' => 'string'])] array $sample = []): array
    {
        return Access::run(Freeform::PERMISSION_FORMS_ACCESS, static function () use ($form, $site, $subject, $body, $recipient, $emailField, $sample): array {
            $target = Access::form($form, Access::site($site));
            [$type, $delivery] = self::notificationTarget($target, $recipient, $emailField);
            $values = self::sampleValues($target, $sample);
            $subject = self::notificationText($target, $subject, 200, false);
            $body = self::notificationText($target, $body, 5000, true);
            $to = Admin::class === $type ? $delivery['recipients'][0]['email'] : ($sample[$emailField] ?? 'recipient@example.invalid');
            if (!filter_var($to, \FILTER_VALIDATE_EMAIL)) {
                throw new ToolCallException('Supply a valid synthetic email address for the recipient field.');
            }
            $render = static fn (string $text): string => preg_replace_callback(self::PLACEHOLDER, static fn (array $match): string => $values[$match[1]] ?? '', $text);

            return ['form' => $target->getHandle(), 'to' => $to, 'subject' => $render($subject), 'body' => $render($body), 'afterSubmit' => self::success($target)];
        });
    }

    /**
     * @param string      $body       plain text with optional {formName} or {fieldHandle} placeholders
     * @param null|string $recipient  One email address for a team notification. Use this or emailField.
     * @param null|string $emailField form Email field handle for a visitor notification
     */
    #[McpTool(name: 'freeform.notifications.draft', description: 'Save a disabled notification draft with an inline plain-text template. Delivery can be enabled in the Craft builder after review.', annotations: new ToolAnnotations(destructiveHint: false))]
    #[RequiresPermission('accessCp')]
    #[RequiresPermission('accessPlugin-freeform')]
    #[RequiresPermission(Freeform::PERMISSION_FORMS_ACCESS)]
    public function draftNotification(string $form, string $site, string $name, string $subject, string $body, ?string $recipient = null, ?string $emailField = null): array
    {
        return Access::editForm($form, $site, static function (Form $target) use ($name, $subject, $body, $recipient, $emailField): array {
            [$type, $delivery] = self::notificationTarget($target, $recipient, $emailField);
            $policy = FormWizardNotificationService::policy(Freeform::getInstance()->getSettings(), true, PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE));
            if (!$policy['canCreateNotificationTemplates'] || Settings::EMAIL_TEMPLATE_STORAGE_TYPE_DATABASE !== $policy['notificationTemplateStorage']) {
                throw new ToolCallException('Saving inline notification drafts requires permission to create database templates in this installation.');
            }
            $name = Access::text($name, 100, true);
            $subject = self::notificationText($target, $subject, 200, false);
            $body = self::notificationText($target, $body, 5000, true);

            $template = NotificationTemplateRecord::create();
            $template->name = $name;
            $template->handle = 'mcp_'.str_replace('-', '', StringHelper::UUID());
            $template->formId = 'form' === $policy['notificationTemplateScope'] ? $target->getId() : null;
            $template->subject = self::compilePlaceholders($subject, false);
            if (mb_strlen($template->subject) > 255) {
                throw new ToolCallException('Shorten the subject or use fewer placeholders.');
            }
            $template->bodyText = self::compilePlaceholders($body, false);
            $template->bodyHtml = nl2br(self::compilePlaceholders(htmlspecialchars($body, \ENT_QUOTES | \ENT_SUBSTITUTE, 'UTF-8'), true));
            $template->autoText = false;
            if (!$template->save()) {
                throw new ToolCallException('The notification template could not be saved.');
            }

            $record = new FormNotificationRecord();
            $record->formId = $target->getId();
            $record->uid = StringHelper::UUID();
            $record->class = $type;
            $record->enabled = false;
            $record->metadata = ['name' => $name, 'template' => (int) $template->id] + $delivery;
            if (!$record->save()) {
                throw new ToolCallException('The notification draft could not be saved.');
            }

            return ['notification' => $record->uid, 'name' => $name, 'enabled' => false];
        });
    }

    private static function notificationTarget(Form $form, ?string $recipient, ?string $emailField): array
    {
        if (!PermissionHelper::checkPermission(Freeform::PERMISSION_NOTIFICATIONS_ACCESS)) {
            throw new ToolCallException('You do not have permission to configure notifications.');
        }
        Access::requireEditorOption('notifications.tab');
        if ((null === $recipient) === (null === $emailField)) {
            throw new ToolCallException('Specify one recipient address or one Email field.');
        }
        if (null !== $recipient) {
            Access::requireEditorOption('notifications.tab.'.Admin::class);
            if (!filter_var($recipient, \FILTER_VALIDATE_EMAIL) || mb_strlen($recipient) > 254) {
                throw new ToolCallException('Supply a valid recipient email address.');
            }

            return [Admin::class, ['recipients' => [['email' => $recipient, 'name' => '']]]];
        }

        Access::requireEditorOption('notifications.tab.'.EmailNotification::class);
        $field = $form->getLayout()->getFields()->get($emailField);
        if (!$field instanceof EmailField || $field->getParentField()) {
            throw new ToolCallException('Choose a top-level Email field from this form.');
        }

        return [EmailNotification::class, ['field' => $field->getUid()]];
    }

    private static function sampleValues(Form $form, array $sample): array
    {
        $values = ['formName' => $form->getName()];
        if (\count($sample) > 30) {
            throw new ToolCallException('Supply at most 30 sample field values.');
        }
        foreach ($sample as $handle => $value) {
            if (!\is_string($handle) || 'formName' === $handle || !self::placeholderFieldExists($form, $handle)) {
                throw new ToolCallException('Use existing field handles as sample keys.');
            }
            $values[$handle] = Access::text($value, 500);
        }

        return $values;
    }

    private static function notificationText(Form $form, string $text, int $max, bool $multiline): string
    {
        $text = Access::text($text, $max, true);
        if ((!$multiline && preg_match('/[\r\n]/', $text)) || str_contains($text, '{#')) {
            throw new ToolCallException('Use plain text and approved placeholders.');
        }
        preg_match_all(self::PLACEHOLDER, $text, $matches);
        foreach ($matches[1] as $handle) {
            if ('formName' !== $handle && !self::placeholderFieldExists($form, $handle)) {
                throw new ToolCallException('Use {formName} or a field handle from this form in placeholders.');
            }
        }

        return $text;
    }

    private static function placeholderFieldExists(Form $form, string $handle): bool
    {
        $field = $form->getLayout()->getFields()->get($handle);

        return $field && !$field->getParentField() && !$field instanceof NoEmailPresenceInterface;
    }

    private static function compilePlaceholders(string $text, bool $html): string
    {
        return preg_replace_callback(self::PLACEHOLDER, static function (array $match) use ($html): string {
            if ('formName' === $match[1]) {
                $expression = 'form.name';
            } else {
                $expression = "_context['".$match[1]."'].valueAsString|default('')";
            }

            return '{{ '.$expression.($html ? '|escape' : '').' }}';
        }, $text);
    }

    private static function success(Form $form): array
    {
        $behavior = $form->getSettings()->getBehavior();

        return ['behavior' => $behavior->successBehavior, 'message' => $behavior->getSuccessMessage(), 'returnUrl' => $behavior->returnUrl];
    }

    private static function validRedirect(string $url): bool
    {
        if (preg_match('/[\s\\\]/u', $url)) {
            return false;
        }
        if (str_starts_with($url, '/')) {
            return !str_starts_with($url, '//');
        }

        $parts = parse_url($url);

        return filter_var($url, \FILTER_VALIDATE_URL) && 'https' === ($parts['scheme'] ?? null) && !isset($parts['user']) && !isset($parts['pass']);
    }
}
