<?php

namespace Solspace\Freeform\Integrations\Other\Supabase;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\CheckboxField;
use Solspace\Freeform\Fields\Implementations\Pro\DatetimeField;
use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

class SupabaseValueConverter
{
    public static function convert(FieldObject $field, mixed $value, ?FieldInterface $freeformField = null): mixed
    {
        $type = $field->getType();
        if ($freeformField instanceof DatetimeField && \in_array($type, [FieldObject::TYPE_DATE, FieldObject::TYPE_DATETIME], true)) {
            $date = $freeformField->getCarbon();
            if (!$date && null !== $value && '' !== $value) {
                self::invalid($field, 'a valid date');
            }
            $value = $date?->format(FieldObject::TYPE_DATE === $type ? 'Y-m-d' : \DATE_ATOM);
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
            if (!\is_scalar($value)) {
                self::invalid($field, 'a boolean');
            }
            $boolean = filter_var($value, \FILTER_VALIDATE_BOOLEAN, \FILTER_NULL_ON_FAILURE);
            if (null === $boolean) {
                self::invalid($field, 'a boolean (true/false or 1/0)');
            }

            return $boolean;
        }

        if (null === $value || '' === $value) {
            return null;
        }
        if (Supabase::TYPE_JSON === $type) {
            if (\is_string($value)) {
                try {
                    return json_decode($value, false, 512, \JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    self::invalid($field, 'valid JSON');
                }
            }

            try {
                json_encode($value, \JSON_THROW_ON_ERROR);
            } catch (\JsonException) {
                self::invalid($field, 'valid JSON');
            }

            return $value;
        }
        if (FieldObject::TYPE_ARRAY === $type) {
            if (\is_string($value) && str_starts_with($value, '[')) {
                try {
                    $value = json_decode($value, true, 512, \JSON_THROW_ON_ERROR);
                } catch (\JsonException) {
                    self::invalid($field, 'a JSON array or a mapped list of options');
                }
            }
            $values = \is_array($value) ? array_values($value) : [$value];
            foreach ($values as $item) {
                if (null !== $item && !\is_scalar($item)) {
                    self::invalid($field, 'a flat array; use a JSON column for nested data');
                }
            }

            return $values;
        }
        if (FieldObject::TYPE_STRING === $type) {
            $values = \is_array($value) ? $value : [$value];
            foreach ($values as $item) {
                if (!\is_scalar($item)) {
                    self::invalid($field, 'text; use a JSON column for nested data');
                }
            }
            $value = trim(implode(', ', $values));
            $options = $field->getOptions();
            if ($options && \count($options)) {
                $valid = false;
                foreach ($options as $option) {
                    if ((string) $option->key === $value) {
                        $valid = true;

                        break;
                    }
                }
                if (!$valid) {
                    self::invalid($field, 'one of the available enum values');
                }
            }

            return $value;
        }
        if (FieldObject::TYPE_NUMERIC === $type) {
            if (\is_int($value)) {
                return $value;
            }
            if (\is_float($value) && is_finite($value) && floor($value) === $value) {
                // Do not truncate out-of-range integral floats.
                if ($value > \PHP_INT_MIN && $value < \PHP_INT_MAX) {
                    return (int) $value;
                }
                self::invalid($field, 'a whole number; supply large integers as text');
            }
            if (!\is_string($value) || !preg_match('/^[+-]?\d+$/D', $value)) {
                self::invalid($field, 'a whole number');
            }
            $integer = filter_var($value, \FILTER_VALIDATE_INT);

            // PostgreSQL bigint values may exceed the PHP integer range. PostgREST accepts text.
            return false === $integer ? $value : $integer;
        }
        if (FieldObject::TYPE_FLOAT === $type) {
            if ((!\is_string($value) && !\is_int($value) && !\is_float($value))
                || !is_numeric($value) || !is_finite((float) $value)
            ) {
                self::invalid($field, 'a number using a dot as the decimal separator');
            }

            // Preserve the precision of decimal strings for PostgreSQL numeric columns.
            return $value;
        }
        if (FieldObject::TYPE_DATE === $type) {
            if (!\is_string($value)) {
                self::invalid($field, 'a date in YYYY-MM-DD format');
            }
            $date = \DateTimeImmutable::createFromFormat('!Y-m-d', $value);
            if (!$date || $date->format('Y-m-d') !== $value) {
                self::invalid($field, 'a date in YYYY-MM-DD format');
            }

            return $value;
        }
        if (FieldObject::TYPE_DATETIME === $type) {
            if (!\is_string($value) || !preg_match('/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})?$/D', $value)) {
                self::invalid($field, 'an ISO 8601 date and time');
            }

            try {
                new \DateTimeImmutable($value);
                $errors = \DateTimeImmutable::getLastErrors();
            } catch (\Exception) {
                self::invalid($field, 'a valid ISO 8601 date and time');
            }
            if ($errors && ($errors['warning_count'] || $errors['error_count'])) {
                self::invalid($field, 'a valid ISO 8601 date and time');
            }

            return $value;
        }

        self::invalid($field, 'a supported column type; refresh the integration fields');
    }

    private static function invalid(FieldObject $field, string $expected): void
    {
        throw new IntegrationException('Supabase column "'.$field->getHandle().'" expects '.$expected.'.');
    }
}
