<?php

namespace Solspace\Freeform\Integrations\CRM\MicrosoftDynamics;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

class MicrosoftDynamicsValueConverter
{
    public static function convert(FieldObject $field, mixed $value, ?FieldInterface $freeformField = null): mixed
    {
        $type = $field->getType();
        if ($freeformField instanceof DatetimeField && \in_array($type, [FieldObject::TYPE_DATE, FieldObject::TYPE_DATETIME], true)) {
            $date = $freeformField->getCarbon();
            if (!$date && null !== $value && '' !== $value) {
                self::invalid($field, 'a valid date in the mapped Freeform field');
            }
            $value = $date ? $date->format(FieldObject::TYPE_DATE === $type ? 'Y-m-d' : \DATE_ATOM) : null;
        }

        if (\is_string($value)) {
            $value = trim($value);
        }

        if (FieldObject::TYPE_BOOLEAN === $type) {
            if ($freeformField instanceof CheckboxField) {
                return $freeformField->isChecked() ?? (null !== $value && '' !== $value);
            }
            if (\is_array($value)) {
                return [] !== $value;
            }
            if (null === $value || '' === $value) {
                return false;
            }

            $boolean = filter_var($value, \FILTER_VALIDATE_BOOLEAN, \FILTER_NULL_ON_FAILURE);
            if (null === $boolean) {
                self::invalid($field, 'a boolean (true/false or 1/0)');
            }

            return $boolean;
        }

        if (null === $value || '' === $value || [] === $value) {
            return null;
        }

        if (FieldObject::TYPE_STRING === $type) {
            $values = \is_array($value) ? $value : [$value];
            foreach ($values as $item) {
                if (!\is_scalar($item)) {
                    self::invalid($field, 'text');
                }
            }

            return trim(implode(', ', $values));
        }

        if (FieldObject::TYPE_ARRAY === $type) {
            if (!\is_array($value) && !\is_string($value) && !\is_int($value)) {
                self::invalid($field, 'numeric choice values');
            }
            $values = \is_array($value) ? $value : explode(',', (string) $value);
            $choices = [];
            foreach ($values as $item) {
                $choices[] = self::choice($field, self::integer($field, \is_string($item) ? trim($item) : $item));
            }

            return implode(',', array_unique($choices));
        }

        if (FieldObject::TYPE_NUMERIC === $type) {
            return self::choice($field, self::integer($field, $value));
        }

        if (FieldObject::TYPE_FLOAT === $type) {
            if ((!\is_string($value) && !\is_int($value) && !\is_float($value)) || !is_numeric($value) || !is_finite((float) $value)) {
                self::invalid($field, 'a number using a dot as the decimal separator');
            }

            return (float) $value;
        }

        if (FieldObject::TYPE_DATE === $type) {
            if (!\is_string($value)) {
                self::invalid($field, 'a date in YYYY-MM-DD format');
            }
            $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value, new \DateTimeZone('UTC'));
            if (!$date || $date->format('Y-m-d') !== $value) {
                self::invalid($field, 'a date in YYYY-MM-DD format');
            }

            return $date->format('Y-m-d\T00:00:00\Z');
        }

        if (FieldObject::TYPE_DATETIME === $type) {
            if (!\is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,7})?(?:Z|[+-]\d{2}:\d{2})$/D', $value)) {
                self::invalid($field, 'an ISO 8601 date and time including a timezone offset');
            }

            try {
                $date = new \DateTimeImmutable($value);
                $errors = \DateTimeImmutable::getLastErrors();
            } catch (\Exception) {
                self::invalid($field, 'a valid ISO 8601 date and time');
            }
            if ($errors && ($errors['warning_count'] || $errors['error_count'])) {
                self::invalid($field, 'a valid ISO 8601 date and time');
            }

            return $value;
        }

        self::invalid($field, 'a supported field type; refresh the integration fields');
    }

    private static function integer(FieldObject $field, mixed $value): int
    {
        if (\is_int($value)) {
            return $value;
        }
        // A Freeform Number field can return an integral float (e.g. 5.0).
        if (\is_float($value) && is_finite($value) && floor($value) === $value && $value >= -2147483648 && $value <= 2147483647) {
            return (int) $value;
        }
        if (!\is_string($value) || !preg_match('/^-?\d+$/D', $value)) {
            self::invalid($field, 'a whole number');
        }

        $number = filter_var($value, \FILTER_VALIDATE_INT);
        if (false === $number) {
            self::invalid($field, 'a whole number within the supported range');
        }

        return $number;
    }

    private static function choice(FieldObject $field, int $value): int
    {
        $options = $field->getOptions();
        if ($options && \count($options)) {
            foreach ($options as $option) {
                if ((string) $option->key === (string) $value) {
                    return $value;
                }
            }
            self::invalid($field, 'one of the numeric choice values; refresh the fields if choices changed');
        }

        return $value;
    }

    private static function invalid(FieldObject $field, string $expected): void
    {
        throw new IntegrationException('Microsoft Dynamics field "'.$field->getHandle().'" expects '.$expected.'.');
    }
}
