<?php

namespace Solspace\Freeform\Bundles\Form\Limiting;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Form\Form;

class DuplicateCheckScope
{
    public const FIELD_TYPES = [
        'hidden', 'invisible', 'text', 'textarea', 'number', 'range', 'email',
        'phone', 'website', 'regex', 'dropdown', 'radios', 'rating', 'opinion-scale',
    ];

    public static function isEnabled(Form $form): bool
    {
        $settings = $form->getSettings()->getBehavior();

        return !empty($settings->duplicateCheckScopeField)
            && \in_array($settings->duplicateCheck, [
                FormLimiting::LIMIT_ONCE_PER_LOGGED_IN_USERS_ONLY,
                FormLimiting::LIMIT_ONCE_PER_EMAIL,
                FormLimiting::LIMIT_ONCE_PER_USER_OR_COOKIE,
                FormLimiting::LIMIT_ONCE_PER_USER_OR_IP_OR_COOKIE,
            ], true);
    }

    public static function getField(Form $form): ?FieldInterface
    {
        $field = $form->getLayout()->getFields()->get($form->getSettings()->getBehavior()->duplicateCheckScopeField);
        if (!$field || !\in_array($field->getType(), self::FIELD_TYPES, true) || !$field->canStoreValues() || $field->getParentField()) {
            return null;
        }

        return $field;
    }

    public static function getValue(FieldInterface $field, mixed $storedValue = null): ?string
    {
        try {
            if (null !== $storedValue) {
                $field = clone $field;
                $field->setValue($storedValue);
            }

            $value = $field->getValue();
        } catch (\TypeError) {
            return null;
        }

        if ((!\is_string($value) && !\is_int($value) && !\is_float($value)) || '' === trim((string) $value)) {
            return null;
        }

        return (string) $value;
    }

    public static function getFormValue(Form $form, FieldInterface $field): ?string
    {
        // Twig's values parameter is available before registerContext() renders the form tag.
        $values = $form->getProperties()->get('values', []);
        if (!$form->isFormPosted() && \is_array($values) && \array_key_exists($field->getHandle(), $values)) {
            if (null === $values[$field->getHandle()]) {
                return null;
            }

            return self::getValue($field, $values[$field->getHandle()]);
        }

        return self::getValue($field);
    }
}
