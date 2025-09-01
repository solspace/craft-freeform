<?php

namespace Solspace\Freeform\Bundles\Backup\Import\FormieV3\Notifications;

use craft\helpers\App;
use Solspace\Freeform\Bundles\Backup\Collections\NotificationCollection;
use Solspace\Freeform\Bundles\Backup\Collections\Templates\NotificationTemplateCollection;
use Solspace\Freeform\Bundles\Backup\DTO\Notification;
use Solspace\Freeform\Bundles\Backup\DTO\Templates\NotificationTemplate as TemplateDTO;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Helpers\HashHelper;
use Solspace\Freeform\Library\Helpers\ProseMirrorHelper;
use Solspace\Freeform\Notifications\Types\Admin\Admin;

class FormieNotificationProcessor
{
    public function processNotifications($form, string $formUid): NotificationCollection
    {
        $collection = new NotificationCollection();

        try {
            $notifications = $form->getNotifications();
        } catch (\Throwable $e) {
            $notifications = [];
        }

        foreach ($notifications as $notification) {
            $notificationDto = new Notification();
            $notificationDto->id = (string) $notification->id;
            $notificationDto->uid = HashHelper::sha1($formUid.'notification'.$notification->id, 32);
            $notificationDto->name = $notification->name ?? 'Notification';
            $notificationDto->type = Admin::class;
            $notificationDto->idAttribute = 'template';
            $notificationDto->enabled = $notification->enabled ?? true;

            $notificationDto->metadata = [
                'name' => $notification->name ?? 'Admin Notification',
                'fromName' => $this->resolveFromName($notification->fromName ?? '', $form),
                'fromEmail' => $this->mapEmailValue(($notification->from ?? '') !== '' ? $notification->from : '{systemEmail}'),
                'replyTo' => $this->mapEmailValue(($notification->replyTo ?? '') !== '' ? $notification->replyTo : '{systemReplyTo}'),
                'subject' => $notification->subject ?? 'Form submission',
                'body' => $this->convertNotificationContent($notification),
                'recipients' => $this->parseRecipients($notification->to ?? ''),
                'cc' => $notification->cc ?? '',
                'bcc' => $notification->bcc ?? '',
                // Link to a per-notification template id
                'template' => $this->buildTemplateId($notification, $formUid),
            ];

            $collection->add($notificationDto);
        }

        return $collection;
    }

    public function processTemplates($form, string $formUid): NotificationTemplateCollection
    {
        $collection = new NotificationTemplateCollection();

        try {
            $notifications = $form->getNotifications();
        } catch (\Throwable $e) {
            $notifications = [];
        }

        foreach ($notifications as $notification) {
            $template = new TemplateDTO();
            $template->id = $this->buildTemplateId($notification, $formUid);
            $template->uid = HashHelper::sha1($formUid.'template'.$notification->id, 32);

            $baseName = $notification->name ?: 'Notification';
            $template->name = $baseName;
            $template->handle = $this->buildTemplateHandle($baseName, $formUid, (string) $notification->id);

            // Resolve sender defaults
            $template->fromName = $this->resolveFromName($notification->fromName ?? '', $form);
            $template->fromEmail = $this->mapEmailValue(($notification->from ?? '') !== '' ? $notification->from : '{systemEmail}');
            $template->replyToName = '';
            // Ignore variable-style reply-to (except systemReplyTo) for templates
            $replyToRaw = $notification->replyTo ?? '';
            if (\is_string($replyToRaw) && preg_match('/^\{.+\}$/', trim($replyToRaw)) && !preg_match('/^\{\s*systemReplyTo\s*\}$/i', trim($replyToRaw))) {
                $template->replyToEmail = null;
            } else {
                $template->replyToEmail = $this->mapEmailValue(($notification->replyTo ?? '') !== '' ? $notification->replyTo : '{systemReplyTo}');
            }

            $template->cc = $this->splitList($notification->cc ?? '');
            $template->bcc = $this->splitList($notification->bcc ?? '');

            $template->subject = $notification->subject ?? 'Form submission';
            $template->body = $this->convertNotificationContent($notification);
            $template->textBody = strip_tags($template->body ?? '');
            $template->autoText = empty($template->textBody);

            $template->includeAttachments = (bool) ($notification->attachFiles ?? false);
            $template->presetAssets = $this->splitList($notification->attachAssets ?? '');

            $collection->add($template);
        }

        return $collection;
    }

    private function convertNotificationContent($notification): string
    {
        $content = $notification->content ?? '';

        if ('' === $content || null === $content) {
            return '';
        }

        // If already structured content – try converting with ProseMirrorHelper
        if (\is_array($content) || \is_object($content)) {
            try {
                $arrayContent = (\is_array($content) ? $content : json_decode(json_encode($content), true)) ?: [];

                return ProseMirrorHelper::toHtml($arrayContent);
            } catch (\Throwable) {
                // Fallback to JSON string if conversion fails
                return json_encode($content) ?: '';
            }
        }

        // If string looks like JSON – convert to HTML
        if (\is_string($content) && (str_starts_with($content, '[') || str_starts_with($content, '{'))) {
            try {
                $json = json_decode($content, true);
                if (\JSON_ERROR_NONE === json_last_error() && \is_array($json)) {
                    return ProseMirrorHelper::toHtml($json);
                }
            } catch (\Throwable) {
                // Ignore and fall back to raw string
            }
        }

        // Plain string – return as-is
        return (string) $content;
    }

    private function buildTemplateId($notification, string $formUid): string
    {
        return (string) $notification->id;
    }

    private function buildTemplateHandle(string $name, string $formUid, string $notificationId): string
    {
        $handle = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', $name));
        $handle = trim($handle, '_');

        return $handle.'_'.substr($formUid, 0, 8).'_'.$notificationId;
    }

    private function generateTemplateHandle($notification, string $formUid): string
    {
        $handle = $notification->handle ?? '';
        if (empty($handle)) {
            $name = $notification->name ?? 'notification';
            $handle = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '_', $name));
            $handle = trim($handle, '_');
        }

        return $handle.'_'.substr($formUid, 0, 8);
    }

    private function parseRecipients(string $value): array
    {
        $result = [];
        $value = trim($value);
        if ('' === $value) {
            return $result;
        }

        if (preg_match_all('/\{[^}]+\}|[^\s,;]+/', $value, $m)) {
            $parts = $m[0];
        } else {
            $parts = [];
        }

        foreach ($parts as $raw) {
            $email = trim($raw);
            if ('' === $email) {
                continue;
            }

            if (preg_match('/^\{\s*systemEmail\s*\}$/i', $email)) {
                $resolved = $this->getSystemEmail();
                $email = $resolved ?: "{{ craft.app.projectConfig.get('email.fromEmail') }}";
            } elseif (preg_match('/^\{\s*systemReplyTo\s*\}$/i', $email)) {
                $resolved = $this->getSystemReplyTo();
                $email = $resolved ?: "{{ craft.app.projectConfig.get('email.replyToEmail') }}";
            } elseif (preg_match('/^\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}$/', $email, $m2)) {
                $handle = $m2[1];
                $email = '{{ '.$handle.'.value }}';
            }

            $result[] = [
                'email' => $email,
                'name' => '',
            ];
        }

        return $result;
    }

    private function mapEmailValue(string $value): string
    {
        $trimmed = trim($value);
        if ('' === $trimmed) {
            return $trimmed;
        }

        if (preg_match('/^\{\s*systemEmail\s*\}$/i', $trimmed)) {
            return $this->getSystemEmail() ?: "{{ craft.app.projectConfig.get('email.fromEmail') }}";
        }

        if (preg_match('/^\{\s*systemReplyTo\s*\}$/i', $trimmed)) {
            return $this->getSystemReplyTo() ?: "{{ craft.app.projectConfig.get('email.replyToEmail') }}";
        }

        if (preg_match('/^\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}$/', $trimmed, $m)) {
            $handle = $m[1];

            return '{{ '.$handle.'.value }}';
        }

        return $trimmed;
    }

    private function resolveFromName(string $value, $form = null): string
    {
        $value = trim($value);
        if ('' !== $value) {
            return $value;
        }

        // Use Formie form title if available
        try {
            if ($form && property_exists($form, 'title') && !empty($form->title)) {
                return (string) $form->title;
            }
        } catch (\Throwable) {
        }

        try {
            $settings = Freeform::getInstance()->settings->getSettingsModel();
            if (!empty($settings->defaultFromName)) {
                return (string) $settings->defaultFromName;
            }
        } catch (\Throwable) {
        }

        return '';
    }

    private function splitList(string $value): array
    {
        $value = trim($value);
        if ('' === $value) {
            return [];
        }

        $parts = preg_split('/[,;]+/', $value) ?: [];

        return array_values(array_filter(array_map('trim', $parts), fn ($v) => '' !== $v));
    }

    private function getSystemEmail(): ?string
    {
        try {
            $email = \Craft::$app->projectConfig->get('email.fromEmail');
            if ($email) {
                return App::parseEnv($email);
            }
        } catch (\Throwable $e) {
        }

        return null;
    }

    private function getSystemReplyTo(): ?string
    {
        try {
            $email = \Craft::$app->projectConfig->get('email.replyToEmail');
            if ($email) {
                return App::parseEnv($email);
            }
        } catch (\Throwable $e) {
        }

        return $this->getSystemEmail();
    }
}
