<?php

namespace Solspace\Freeform\Attributes\Property\Validators;

use Solspace\Freeform\Attributes\Property\PropertyValidatorInterface;
use Solspace\Freeform\Freeform;

#[\Attribute(\Attribute::TARGET_PROPERTY)]
class EventParameters implements PropertyValidatorInterface
{
    public const MAX_MAPPINGS = 24;

    public static function isValidName(string $name): bool
    {
        return (bool) preg_match('/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/D', $name)
            && !preg_match('/^(?:google_|ga_|firebase_|gtm_)/i', $name)
            && !\in_array(strtolower($name), ['event', 'form', 'submission', 'form_name', 'constructor', 'prototype'], true);
    }

    public function validate(mixed $value): array
    {
        if (!\is_array($value) || \count($value) > self::MAX_MAPPINGS) {
            return [Freeform::t('Add up to 24 event parameter mappings.')];
        }

        $seen = [];
        foreach ($value as $row) {
            if (!\is_array($row) || !\is_string($row[0] ?? null) || !\is_string($row[1] ?? null)) {
                return [Freeform::t('Each event parameter needs a name and a form field.')];
            }
            [$name, $field] = array_map('trim', [$row[0], $row[1]]);
            if ('' === $name && '' === $field) {
                continue;
            }
            if (!self::isValidName($name) || '' === $field || isset($seen[$name])) {
                return [Freeform::t('Use unique parameter names starting with a letter, followed by letters, numbers, or underscores (up to 40 characters), and select a field. Reserved names and prefixes cannot be used; form_name is included automatically.')];
            }
            $seen[$name] = true;
        }

        return [];
    }
}
