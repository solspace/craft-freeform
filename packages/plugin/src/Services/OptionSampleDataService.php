<?php

namespace Solspace\Freeform\Services;

use Solspace\Freeform\Attributes\Property\Implementations\Options\Option;
use Solspace\Freeform\Attributes\Property\Implementations\Options\OptionCollection;
use Solspace\Freeform\Fields\BaseOptionsField;
use Solspace\Freeform\Fields\Implementations\CheckboxesField;
use Solspace\Freeform\Fields\Interfaces\MultiValueInterface;

class OptionSampleDataService
{
    private \WeakMap $samples;

    public function __construct()
    {
        $this->samples = new \WeakMap();
    }

    public function getValue(BaseOptionsField $field): array|string
    {
        // Context events can run more than once. Keep the same defaults for this field instance.
        if (isset($this->samples[$field])) {
            return $this->samples[$field];
        }

        [$minimum, $maximum] = $this->getSelectionRange($field);

        return $this->samples[$field] = $this->select(
            $field->getOptions(),
            $field instanceof MultiValueInterface,
            $minimum,
            $maximum,
        );
    }

    public function select(OptionCollection $options, bool $multiple, int $minimum = 2, int $maximum = 3): array|string
    {
        $values = [];
        $collect = static function (OptionCollection $collection) use (&$collect, &$values): void {
            foreach ($collection as $option) {
                if ($option instanceof OptionCollection) {
                    $collect($option);
                } elseif ($option instanceof Option && '' !== $option->getValue()) {
                    $values[] = $option->getValue();
                }
            }
        };
        $collect($options);
        $values = array_values(array_unique($values));
        $available = \count($values);
        if (!$available) {
            return $multiple ? [] : '';
        }

        shuffle($values);
        if (!$multiple) {
            return $values[0];
        }

        $maximum = min($available, max(0, $maximum));
        $minimum = min($maximum, max(0, $minimum));
        $count = random_int($minimum, $maximum);

        return \array_slice($values, 0, $count);
    }

    private function getSelectionRange(BaseOptionsField $field): array
    {
        if ($field instanceof CheckboxesField) {
            return match ($field->getLimit()) {
                CheckboxesField::LIMIT_REQUIRE_ALL => [\PHP_INT_MAX, \PHP_INT_MAX],
                CheckboxesField::LIMIT_MINIMUM => [max(2, $field->getLimitMin() ?? 0), max(3, $field->getLimitMin() ?? 0)],
                CheckboxesField::LIMIT_MAXIMUM => [2, min(3, $field->getLimitMax() ?? 3)],
                CheckboxesField::LIMIT_RANGE => [max(2, $field->getLimitRange()[0] ?? 0), min(max(3, $field->getLimitRange()[0] ?? 0), $field->getLimitRange()[1] ?? 3)],
                default => [2, 3],
            };
        }

        return [2, 3];
    }
}
