<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Library\Helpers\BooleanHelper;
use Solspace\Freeform\Models\Settings;

/** The setup guide intentionally edits only these existing settings. */
class SetupSettings
{
    public const OPTIONS = [
        'abTests' => ['true', 'false'],
        'emailTemplateMethod' => ['form', 'global', 'all'],
        'spamProtectionBehavior' => ['simulate_success', 'display_errors'],
        'spamFolderEnabled' => ['true', 'false'],
        'loggingStyle' => ['activity', 'classic', 'none'],
        'activityMode' => ['minimal', 'standard', 'detailed', 'custom'],
        'loggingLevel' => ['error', 'info', 'debug'],
        'defaultFromEmail' => null,
        'defaultFromName' => null,
        'emailTemplateStorageType' => ['files', 'database', 'files_database'],
        'emailTemplateDefault' => ['files', 'database'],
        'defaultView' => ['forms', 'submissions'],
        'defaultAiIntegration' => null,
        'useQueueForEmailNotifications' => ['true', 'false'],
        'useQueueForIntegrations' => ['true', 'false'],
        'useQueueForAiFields' => ['true', 'false'],
        'alertNotificationRecipients' => null,
        'errorNotificationRecipients' => null,
        'clientDigestRecipients' => null,
        'clientDigestFrequency' => null,
        'defaultFormattingTemplate' => null,
        'defaultStoreData' => ['true', 'false'],
        'defaultUploadSource' => null,
        'defaultUploadCount' => null,
        'defaultUploadSize' => null,
        'defaultUploadRequirements' => ['true', 'false'],
        'defaultUploadKinds' => ['image', 'pdf', 'image,pdf'],
    ];

    public const PATHS = [
        'defaultFormattingTemplate' => ['settings', 'general', 'formattingTemplate'],
        'defaultStoreData' => ['settings', 'dataStorage', 'storeData'],
        'defaultUploadSource' => ['props', 'file', 'source'],
        'defaultUploadCount' => ['props', 'file', 'count'],
        'defaultUploadSize' => ['props', 'file', 'maxFileSizeKB'],
        'defaultUploadRequirements' => ['props', 'file', 'showUploadRequirements'],
        'defaultUploadKinds' => ['props', 'file', 'fileKinds'],
    ];

    public static function values(Settings $settings): array
    {
        $values = [];
        foreach (self::OPTIONS as $key => $options) {
            $item = self::defaultItem($settings, $key);
            $value = isset(self::PATHS[$key]) ? ($item?->getValue() ?? '') : $settings->{$key};
            $value = \is_array($value) ? implode(',', $value) : $value;
            $values[$key] = \is_bool($value) ? ($value ? 'true' : 'false') : (string) ($value ?? '');
        }
        foreach (self::OPTIONS as $key => $choices) {
            if (['true', 'false'] === $choices && !str_starts_with($values[$key], '$')) {
                $values[$key] = BooleanHelper::normalize($values[$key]) ? 'true' : 'false';
            }
        }
        // Earlier configurations can have a separate logging guard switched off.
        if (!str_starts_with($values['spamFolderEnabled'], '$')) {
            $values['spamFolderEnabled'] = BooleanHelper::normalize($values['spamFolderEnabled']) ? 'true' : 'false';
        }
        $values['loggingStyle'] = $settings->getEffectiveLoggingStyle();

        return $values;
    }

    public static function locked(Settings $settings, array $overrides): array
    {
        $locked = [];
        foreach (self::OPTIONS as $key => $options) {
            $path = isset(self::PATHS[$key]) ? ['defaults', ...self::PATHS[$key], 'value'] : [$key];
            $branch = $overrides;
            $configured = true;
            foreach ($path as $part) {
                if (!\is_array($branch)) {
                    break;
                }
                if (!\array_key_exists($part, $branch)) {
                    $configured = false;

                    break;
                }
                $branch = $branch[$part];
            }
            if ($configured || self::defaultItem($settings, $key)?->isLocked() || str_starts_with(self::values($settings)[$key], '$')) {
                $locked[] = $key;
            }
        }
        foreach (['activityEnabled', 'technicalFileLogging'] as $guard) {
            if (\array_key_exists($guard, $overrides) || str_starts_with($settings->{$guard}, '$')) {
                $locked[] = 'loggingStyle';
            }
        }

        return array_values(array_unique($locked));
    }

    /** Validate the patch and reject stale writes before changing the settings model. */
    public static function changes(mixed $changes, mixed $original, array $current, array $locked): array
    {
        if (!\is_array($changes) || !\is_array($original)) {
            throw new \InvalidArgumentException('Invalid setup settings.');
        }
        $result = [];
        foreach ($changes as $key => $value) {
            if (!\array_key_exists($key, self::OPTIONS) || !\is_string($value)) {
                throw new \InvalidArgumentException('Invalid setup settings.');
            }
            $options = self::OPTIONS[$key];
            if (null !== $options && !\in_array($value, $options, true)) {
                throw new \InvalidArgumentException('Choose a valid setting value.');
            }
            if (null === $options && (mb_strlen($value) > 500 || preg_match('/[\x00-\x1f]/', $value))) {
                throw new \InvalidArgumentException('Sender defaults must be a single line of up to 500 characters.');
            }
            if ('defaultFromEmail' === $key && '' !== $value && !str_contains($value, '{{') && !filter_var($value, \FILTER_VALIDATE_EMAIL)) {
                throw new \InvalidArgumentException('Enter a valid sender email address or Twig variable.');
            }
            if (\in_array($key, ['alertNotificationRecipients', 'errorNotificationRecipients', 'clientDigestRecipients'], true) && '' !== $value) {
                foreach (explode(',', $value) as $email) {
                    if (!filter_var(trim($email), \FILTER_VALIDATE_EMAIL)) {
                        throw new \InvalidArgumentException('Enter valid comma-separated email addresses.');
                    }
                }
            }
            if (\in_array($key, ['defaultUploadCount', 'defaultUploadSize'], true) && (!ctype_digit($value) || (int) $value < 1 || (int) $value > 1048576)) {
                throw new \InvalidArgumentException('Enter a positive upload limit.');
            }
            if ('clientDigestFrequency' === $key && !\in_array($value, ['-1', '0', '1', '2', '3', '4', '5', '6'], true)) {
                throw new \InvalidArgumentException('Choose a valid digest frequency.');
            }
            // A retry after a successful but interrupted response is an idempotent no-op.
            if ($value === $current[$key]) {
                continue;
            }
            if (\in_array($key, $locked, true)) {
                throw new \DomainException('This setting is managed in your project configuration.');
            }
            if (!\array_key_exists($key, $original) || $original[$key] !== $current[$key]) {
                throw new \RuntimeException('Settings changed while this guide was open. Reload the guide before saving.', 409);
            }
            $result[$key] = $value;
        }
        if (isset($result['loggingStyle'])) {
            if ('activity' === $result['loggingStyle']) {
                $result['activityEnabled'] = 'true';
            } elseif ('classic' === $result['loggingStyle']) {
                $result['technicalFileLogging'] = 'true';
            }
        }

        return $result;
    }

    /** Apply only reviewed leaves. Preserve unrelated nested defaults and their lock flags. */
    public static function merge(array $stored, array $changes): array
    {
        foreach ($changes as $key => $value) {
            if (!isset(self::PATHS[$key])) {
                $stored[$key] = $value;

                continue;
            }
            $branch = &$stored['defaults'];
            foreach (self::PATHS[$key] as $part) {
                $branch = &$branch[$part];
            }
            $branch['value'] = \in_array($key, ['defaultStoreData', 'defaultUploadRequirements'], true) ? 'true' === $value : $value;
            if ('defaultUploadKinds' === $key) {
                $branch['value'] = explode(',', $value);
            }
            unset($branch);
        }

        return $stored;
    }

    private static function defaultItem(Settings $settings, string $key): ?object
    {
        if (!isset(self::PATHS[$key]) || !isset($settings->defaults)) {
            return null;
        }
        $item = $settings->defaults;
        foreach (self::PATHS[$key] as $part) {
            $item = $item->{$part};
        }

        return $item;
    }
}
