<?php

namespace Solspace\Freeform\Library\Configuration;

use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersDefaults;
use Solspace\Freeform\Bundles\Form\Limiting\LimitedUsers\LimitedUsersPresets;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Codepack\MessageTemplateSamples;
use Solspace\Freeform\Library\Helpers\PermissionHelper;
use Solspace\Freeform\Models\Settings;
use Solspace\Freeform\Records\LimitedUsersRecord;
use Solspace\Freeform\Records\NotificationTemplateRecord;

/** Creates reviewed starter resources without assigning permissions or changing existing forms. */
class SetupResources
{
    public static function validate(mixed $input): array
    {
        if (!\is_array($input) || array_diff(array_keys($input), ['profile', 'templates', 'requestId', 'templateDefaults'])) {
            throw new \InvalidArgumentException('Invalid setup resources.');
        }
        if (!isset($input['requestId']) || !\is_string($input['requestId']) || !preg_match('/^[a-f0-9-]{36}$/iD', $input['requestId'])) {
            throw new \InvalidArgumentException('Invalid setup resources.');
        }
        if (isset($input['profile'])) {
            $profile = $input['profile'];
            if (!\is_array($profile) || array_diff(array_keys($profile), ['name', 'level', 'uploads']) || !\in_array($profile['level'] ?? null, ['simplified-building', 'advanced-building', 'basic', 'flexible'], true)) {
                throw new \InvalidArgumentException('Invalid setup resources.');
            }
            self::name($profile['name'] ?? null);
            if (isset($profile['uploads']) && !\is_bool($profile['uploads'])) {
                throw new \InvalidArgumentException('Invalid setup resources.');
            }
        }
        if (isset($input['templates'])) {
            $original = $input['templateDefaults'] ?? null;
            if (!\is_array($original) || 2 !== \count($original) || array_diff(array_keys($original), ['admin', 'emailField']) || \count(array_filter($original, static fn ($value) => \is_string($value) && mb_strlen($value) < 500)) !== 2) {
                throw new \InvalidArgumentException('Invalid setup resources.');
            }
            $templates = $input['templates'];
            if (!\is_array($templates) || array_diff(array_keys($templates), ['team', 'visitor']) || 2 !== \count($templates)) {
                throw new \InvalidArgumentException('Invalid setup resources.');
            }
            foreach ($templates as $name) {
                self::name($name);
            }
            if ($templates['team'] === $templates['visitor']) {
                throw new \InvalidArgumentException('Choose a different name for each email template.');
            }
        }

        return $input;
    }

    public static function profileSettings(array $items, string $level, bool $uploads = false): array
    {
        // Keep in-progress setup sessions working after the preset names change.
        $preset = match ($level) {
            'basic' => 'simplified-building',
            'flexible' => 'advanced-building',
            default => $level,
        };

        return LimitedUsersPresets::settings($items, $preset, $uploads);
    }

    /** Called inside the setup transaction. Direct record saves never commit the caller's transaction. */
    public function create(array $input, Settings $settings, array $stored, array $overrides): array
    {
        if (isset($input['profile'])) {
            $defaults = \Craft::$container->get(LimitedUsersDefaults::class)->get();
            $record = new LimitedUsersRecord();
            $record->name = self::availableResourceName($input['profile']['name'], LimitedUsersRecord::find()->select(['name'])->column());
            $record->description = Freeform::t('Created by the setup guide. Assign this profile through Craft user permissions when ready.');
            $record->settings = json_encode(self::profileSettings(json_decode(json_encode($defaults), true), $input['profile']['level'], $input['profile']['uploads'] ?? false));
            if (!$record->save()) {
                throw new \InvalidArgumentException('The Limited Users profile could not be created.');
            }
        }
        if (isset($input['templates'])) {
            PermissionHelper::requirePermission(Freeform::PERMISSION_NOTIFICATIONS_MANAGE);
            $method = $stored['emailTemplateMethod'] ?? $settings->emailTemplateMethod;
            $storage = $stored['emailTemplateStorageType'] ?? $settings->emailTemplateStorageType;
            if ('form' === $method || 'files' === $storage) {
                throw new \InvalidArgumentException('Starter emails require shared templates with database storage available.');
            }
            foreach (['admin', 'emailField'] as $kind) {
                if (isset($overrides['defaults']['notifications'][$kind]) || $settings->defaults->notifications->{$kind}->template->isLocked()) {
                    throw new \DomainException('Default notification templates are managed in your project configuration.');
                }
                if ($input['templateDefaults'][$kind] !== (string) $settings->defaults->notifications->{$kind}->template->getValue()) {
                    throw new \RuntimeException('Default notification templates changed while this guide was open. Reload the guide.');
                }
            }
            foreach ($input['templates'] as $kind => $name) {
                $name = self::availableResourceName($name, NotificationTemplateRecord::find()->select(['name'])->where(['formId' => null])->column());
                $sample = 'team' === $kind ? 'team-notification' : 'visitor-confirmation';
                $path = __DIR__.'/../../Resources/message-template-samples/email/'.$sample.'.twig';
                if (!MessageTemplateSamples::get('email', $sample)) {
                    throw new \InvalidArgumentException('The email template sample is unavailable.');
                }
                $record = NotificationTemplateRecord::createFromTemplate($path);
                $record->filepath = null;
                $record->formId = null;
                $record->name = $name;
                $record->handle = 'setup_'.str_replace('-', '', $input['requestId']).'_'.$kind;
                $record->fromName = \array_key_exists('defaultFromName', $overrides) ? $settings->defaultFromName : ($stored['defaultFromName'] ?? $settings->defaultFromName);
                $record->fromEmail = \array_key_exists('defaultFromEmail', $overrides) ? $settings->defaultFromEmail : ($stored['defaultFromEmail'] ?? $settings->defaultFromEmail);
                if (!$record->save()) {
                    throw new \InvalidArgumentException('The email templates could not be created. Check the sender defaults.');
                }
                $default = 'team' === $kind ? 'admin' : 'emailField';
                $stored['defaults']['notifications'][$default]['template']['value'] = (string) $record->id;
            }
        }

        return $stored;
    }

    public static function availableResourceName(string $name, array $existing): string
    {
        $used = array_fill_keys(array_map(static fn (string $value): string => mb_strtolower($value), $existing), true);
        $candidate = $name;
        for ($number = 2; isset($used[mb_strtolower($candidate)]); ++$number) {
            $suffix = ' '.$number;
            $candidate = rtrim(mb_substr($name, 0, 100 - mb_strlen($suffix))).$suffix;
        }

        return $candidate;
    }

    private static function name(mixed $name): void
    {
        if (!\is_string($name) || '' === trim($name) || $name !== trim($name) || mb_strlen($name) > 100 || preg_match('/[\x00-\x1f]/', $name)) {
            throw new \InvalidArgumentException('Enter a name of up to 100 characters.');
        }
    }
}
