<?php

namespace Solspace\Freeform\Services\Headless;

use Solspace\Freeform\Form\Form;

class HeadlessPayloadHelper
{
    /**
     * @return array<string, mixed>
     */
    public static function getPayload(Form $form): array
    {
        $payload = $form->getProperties()->get('headlessPayload', []);

        return \is_array($payload) ? $payload : [];
    }

    /**
     * @return array<string, mixed>
     */
    public static function getMeta(Form $form): array
    {
        $meta = self::getPayload($form)['meta'] ?? [];

        return \is_array($meta) ? $meta : [];
    }

    /**
     * @return array<string, mixed>
     */
    public static function getValues(Form $form): array
    {
        $values = self::getPayload($form)['values'] ?? [];

        return \is_array($values) ? $values : [];
    }

    public static function getNamedMetaValue(Form $form, string $key, string $expectedName): ?string
    {
        $meta = self::getMeta($form);
        $entry = $meta[$key] ?? null;

        if (
            \is_array($entry)
            && isset($entry['name'], $entry['value'])
            && $expectedName === $entry['name']
        ) {
            return (string) $entry['value'];
        }

        return null;
    }

    public static function getCaptchaResponse(Form $form, string $expectedName): ?string
    {
        $value = self::getNamedMetaValue($form, 'captcha', $expectedName);
        if (null !== $value && '' !== $value) {
            return $value;
        }

        $captchas = self::getMeta($form)['captchas'] ?? [];
        if (!\is_array($captchas)) {
            return null;
        }

        foreach ($captchas as $captcha) {
            if (
                \is_array($captcha)
                && ($captcha['name'] ?? '') === $expectedName
                && !empty($captcha['value'])
            ) {
                return (string) $captcha['value'];
            }
        }

        return null;
    }
}
