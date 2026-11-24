<?php

namespace Solspace\Freeform\Library\Forms\Merge;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations as Fields;
use Solspace\Freeform\Fields\Interfaces\EncryptionInterface;
use Solspace\Freeform\Fields\Interfaces\GeneratedOptionsInterface;
use Solspace\Freeform\Fields\Properties\Options\Custom\Custom;
use Solspace\Freeform\Freeform;

class FieldMapping
{
    private const SINGLE_CHOICE = [Fields\DropdownField::class, Fields\RadiosField::class];
    private const MULTIPLE_CHOICE = [Fields\CheckboxesField::class, Fields\MultipleSelectField::class];

    public static function canAdd(FieldInterface $field): bool
    {
        if ($field->getParentField() || !$field->getHandle() || ($field instanceof EncryptionInterface && $field->isEncrypted())) {
            return false;
        }

        if ($field instanceof GeneratedOptionsInterface) {
            return self::choices($field) !== null;
        }

        return \in_array($field::class, [
            Fields\TextField::class,
            Fields\TextareaField::class,
            Fields\EmailField::class,
            Fields\NumberField::class,
            Fields\CheckboxField::class,
            Fields\HiddenField::class,
            Fields\Pro\PhoneField::class,
            Fields\Pro\WebsiteField::class,
        ], true);
    }

    public static function compatible(FieldInterface $source, FieldInterface $target): bool
    {
        if (!self::canAdd($source) || !self::canAdd($target)) {
            return false;
        }

        if ($source::class === $target::class || self::isText($source) && self::isText($target)) {
            return true;
        }

        foreach ([self::SINGLE_CHOICE, self::MULTIPLE_CHOICE] as $types) {
            if (\in_array($source::class, $types, true) && \in_array($target::class, $types, true)) {
                return true;
            }
        }

        return false;
    }

    public static function populated(FieldInterface $field, ?string $value): bool
    {
        return self::hasStoredValue($value, self::usesChoiceArray($field));
    }

    public static function hasStoredValue(?string $value, bool $choiceArray): bool
    {
        return null !== $value && '' !== $value && (!$choiceArray || [] !== json_decode($value));
    }

    public static function usesChoiceArray(FieldInterface $field): bool
    {
        return \in_array($field::class, self::MULTIPLE_CHOICE, true);
    }

    public static function storedValueValidator(FieldInterface $target, array $additions = []): ?\Closure
    {
        return self::choiceValidator(self::choices($target, $additions), self::usesChoiceArray($target));
    }

    public static function optionAdditions(FieldInterface $source, FieldInterface $target): array
    {
        $allowed = self::choices($target);
        if (null === $allowed || null === self::choices($source)) {
            return [];
        }

        $seen = array_fill_keys($allowed, true);
        $additions = [];
        foreach ($source->getOptionConfiguration()->toArray()['options'] as $option) {
            $value = (string) $option['value'];
            if ($option['optgroup'] || '' === $value || isset($seen[$value])) {
                continue;
            }

            $additions[] = $option;
            $seen[$value] = true;
        }

        return $additions;
    }

    public static function appendOptions(array $configuration, array $additions): array
    {
        // Custom options that follow a group heading belong to that group.
        $lastGroup = null;
        foreach ($configuration['options'] ?? [] as $option) {
            if (!empty($option['optgroup'])) {
                $lastGroup = $option['label'];
            }
        }
        if (null !== $lastGroup) {
            $groupLabel = Freeform::t('Merged options');
            if ($lastGroup !== $groupLabel) {
                $configuration['options'][] = ['label' => $groupLabel, 'value' => $groupLabel, 'optgroup' => true];
            }
        }
        foreach ($additions as $option) {
            $configuration['options'][] = $option;
            if ((string) $option['value'] !== (string) $option['label']) {
                $configuration['useCustomValues'] = true;
            }
        }

        return $configuration;
    }

    public static function choiceValidator(?array $choices, bool $multiple): ?\Closure
    {
        if (null === $choices) {
            return null;
        }

        $allowed = array_fill_keys($choices, true);

        return static function (?string $value) use ($allowed, $multiple): bool {
            if (null === $value || '' === $value) {
                return true;
            }

            $values = $multiple ? json_decode($value) : [$value];
            if (!\is_array($values)) {
                return false;
            }

            foreach ($values as $option) {
                if ((!\is_string($option) && !\is_int($option)) || !isset($allowed[(string) $option])) {
                    return false;
                }
            }

            return true;
        };
    }

    /**
     * @param FieldInterface[] $source
     * @param FieldInterface[] $target
     */
    public static function rows(array $source, array $target): array
    {
        $rows = [];
        $labels = [];
        foreach ($source as $id => $field) {
            $options = [];
            $optionTargets = [];
            $matches = [];
            foreach ($target as $targetId => $candidate) {
                if (!self::compatible($field, $candidate)) {
                    continue;
                }

                $options[$targetId] = $labels[$targetId] ??= self::label($candidate);
                if (self::optionAdditions($field, $candidate)) {
                    $optionTargets[$targetId] = true;
                }
                if (0 === strcasecmp($field->getHandle(), $candidate->getHandle())) {
                    $matches[] = (string) $targetId;
                }
            }

            $rows[$id] = [
                'label' => self::label($field),
                'canAdd' => self::canAdd($field),
                'targets' => $options,
                'optionTargets' => $optionTargets,
                'suggested' => 1 === \count($matches) ? $matches[0] : null,
            ];
        }

        $suggestions = array_count_values(array_column(array_filter($rows, static fn ($row) => null !== $row['suggested']), 'suggested'));
        foreach ($rows as &$row) {
            $targetId = $row['suggested'];
            if (null === $targetId || $suggestions[$targetId] > 1) {
                $row['suggested'] = null;
            } elseif (isset($row['optionTargets'][$targetId])) {
                $row['suggested'] = 'options:'.$targetId;
            }
        }

        return $rows;
    }

    public static function validate(array $input, array $rows, array $pages): array
    {
        if (array_diff_key($rows, $input) || array_diff_key($input, $rows)) {
            throw new \DomainException(Freeform::t('The original form’s layout changed or some field choices were missing. Review your mapping again.'));
        }

        $map = [];
        $usedTargets = [];
        foreach ($rows as $id => $row) {
            $value = $input[$id] ?? 'skip';
            if (!\is_string($value)) {
                throw new \DomainException(Freeform::t('Choose a valid action for every field on the original form.'));
            }
            if ('skip' === $value) {
                continue;
            }
            if (str_starts_with($value, 'add:') && $row['canAdd'] && isset($pages[substr($value, 4)])) {
                $map[$id] = $value;

                continue;
            }
            if (str_starts_with($value, 'options:')) {
                $value = substr($value, 8);
                if (!isset($row['optionTargets'][$value])) {
                    throw new \DomainException(Freeform::t('Choose a receiving field that can add choices from {field}.', ['field' => $row['label']]));
                }
            }
            if (!isset($row['targets'][$value])) {
                throw new \DomainException(Freeform::t('Choose a compatible field in the receiving form for {field}.', ['field' => $row['label']]));
            }
            if (isset($usedTargets[$value])) {
                throw new \DomainException(Freeform::t('Each field in the receiving form can receive values from only one field on the original form.'));
            }

            $usedTargets[$value] = true;
            $map[$id] = $value;
        }

        return $map;
    }

    public static function choices(FieldInterface $field, array $additions = []): ?array
    {
        if (!\in_array($field::class, [...self::SINGLE_CHOICE, ...self::MULTIPLE_CHOICE], true)) {
            return null;
        }

        $configuration = $field->getOptionConfiguration();
        if (!$configuration instanceof Custom) {
            return null;
        }

        return array_values(array_map(
            static fn ($option) => (string) $option['value'],
            [...array_filter($configuration->toArray()['options'], static fn ($option) => !$option['optgroup']), ...$additions],
        ));
    }

    public static function isText(FieldInterface $field): bool
    {
        return \in_array($field::class, [Fields\TextField::class, Fields\TextareaField::class], true);
    }

    private static function label(FieldInterface $field): string
    {
        return $field->getLabel() ? $field->getLabel().' ('.$field->getHandle().')' : (string) $field->getHandle();
    }
}
