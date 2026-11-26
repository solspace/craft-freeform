<?php

namespace Solspace\Freeform\Bundles\Mcp;

use Mcp\Exception\ToolCallException;
use Solspace\Freeform\Bundles\Attributes\Property\PropertyProvider;
use Solspace\Freeform\Fields\Implementations\Pro\RatingField;

final class FieldSettings
{
    public const CREATION_PROPERTIES = [
        'handle' => ['type' => 'string'],
        'type' => ['type' => 'string'],
        'label' => ['type' => 'string'],
        'required' => ['type' => 'boolean'],
        'instructions' => ['type' => 'string'],
        'options' => ['type' => 'array', 'items' => ['type' => 'string']],
        'placeholder' => ['type' => 'string', 'description' => 'Plain-text placeholder for supported fields.'],
        'maxLength' => ['type' => 'integer', 'minimum' => 0, 'description' => 'Character limit for supported fields. Use 0 for no limit.'],
        'maxStars' => ['type' => 'integer', 'minimum' => RatingField::MIN_VALUE, 'maximum' => RatingField::MAX_VALUE, 'description' => 'Star count for rating fields only.'],
    ];

    public const ADDITIONAL_PROPERTIES = [
        'placeholder' => 'placeholder',
        'maxLength' => 'maxLength',
        'maxStars' => 'maxValue',
    ];

    public static function propertyName(string $setting): string
    {
        return self::ADDITIONAL_PROPERTIES[$setting] ?? $setting;
    }

    public static function validate(string $fieldClass, array $settings): array
    {
        $properties = \Craft::$container->get(PropertyProvider::class)->getEditableProperties($fieldClass);
        foreach ($settings as $key => $value) {
            $property = $properties->get(self::propertyName($key));
            if (!$property || !$property->visible || $property->disabled || !$property->matchesEdition()
                || ('maxStars' === $key && RatingField::class !== $fieldClass)) {
                throw new ToolCallException("This field does not support editing {$key}.");
            }

            $value = match ($key) {
                'label' => Access::text($value, 200, true),
                'instructions' => Access::text($value, 500),
                'placeholder' => Access::text($value, 500),
                'maxLength' => self::integer($value, 0, \PHP_INT_MAX, 'Use a positive character limit, or 0 to clear it.') ?: null,
                'maxStars' => self::integer($value, RatingField::MIN_VALUE, RatingField::MAX_VALUE, 'Use between 3 and 10 stars.'),
                'required' => $value,
                default => throw new ToolCallException("Unsupported field setting: {$key}."),
            };
            foreach ($property->validators as $validator) {
                if ($errors = $validator->validate($value)) {
                    throw new ToolCallException(implode(' ', $errors));
                }
            }
            $settings[$key] = $value;
        }

        return $settings;
    }

    private static function integer(mixed $value, int $min, int $max, string $error): int
    {
        if (!\is_int($value) || $value < $min || $value > $max) {
            throw new ToolCallException($error);
        }

        return $value;
    }
}
