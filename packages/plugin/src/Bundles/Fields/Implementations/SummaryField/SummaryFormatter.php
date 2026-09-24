<?php

namespace Solspace\Freeform\Bundles\Fields\Implementations\SummaryField;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\Pro\CardsField;
use Solspace\Freeform\Fields\Implementations\Pro\TableField;
use Solspace\Freeform\Fields\Interfaces\OptionsInterface;

class SummaryFormatter
{
    // An allowlist prevents newly registered/sensitive field types leaking into a review.
    private const TYPES = [
        'text', 'textarea', 'email', 'number', 'range', 'phone', 'website', 'regex',
        'dropdown', 'multiple-select', 'checkbox', 'checkboxes', 'radios',
        'datetime', 'rating', 'opinion-scale', 'cards', 'calculation', 'file', 'file-dnd', 'table',
    ];

    public static function supports(string $type): bool
    {
        return \in_array($type, self::TYPES, true);
    }

    public function describe(FieldInterface $field): array
    {
        $options = [];
        if ($field instanceof OptionsInterface) {
            foreach ($field->getOptions()->toTwigArray() as $option) {
                if (isset($option['value'])) {
                    $options[] = ['value' => $option['value'], 'label' => $field->translateOptionLabel($option['label'])];
                }
            }
        } elseif ($field instanceof CardsField) {
            foreach ($field->getCards() as $card) {
                $options[] = ['value' => $card->value ?: $card->label, 'label' => $card->label];
            }
        }

        return [
            'handle' => $field->getHandle(),
            'type' => $field->getType(),
            'label' => html_entity_decode(strip_tags((string) $field->getLabel()), \ENT_QUOTES | \ENT_HTML5, 'UTF-8'),
            'options' => $options,
            'columns' => $field instanceof TableField ? array_map(static fn ($column) => ['label' => $column->label, 'type' => $column->type, 'options' => $column->options], iterator_to_array($field->getTableLayout())) : [],
        ];
    }

    public function format(FieldInterface $field, array $config): string
    {
        if (!self::supports($field->getType())) {
            return '';
        }

        return $this->formatValue($this->describe($field), $field->getValue(), $config);
    }

    public function formatValue(array $source, mixed $value, array $config): string
    {
        $type = $source['type'];
        if ('checkbox' === $type) {
            $checked = !\in_array($value, [null, false, '', 0, '0'], true);

            return $checked ? $config['checkedLabel'] : ($config['hideEmpty'] ? '' : $config['uncheckedLabel']);
        }

        if (\in_array($type, ['file', 'file-dnd'], true)) {
            $count = \is_array($value) ? \count(array_filter($value)) : (empty($value) ? 0 : 1);

            return $count ? $config['filesLabel'].': '.$count : '';
        }

        if ('table' === $type) {
            $rows = [];
            foreach (\is_array($value) ? $value : [] as $row) {
                if (!\is_array($row)) {
                    continue;
                }
                $cells = [];
                foreach ($source['columns'] ?? [] as $index => $column) {
                    $text = $this->formatValue($column, $row[$index] ?? null, $config);
                    if ('' !== $text) {
                        $cells[] = $column['label'].': '.$text;
                    }
                }
                if ($cells) {
                    $rows[] = implode('; ', $cells);
                }
            }

            return implode("\n", $rows);
        }

        $values = \is_array($value) ? $value : [$value];
        $labels = [];
        foreach ($values as $item) {
            if (!\is_scalar($item) || '' === (string) $item) {
                continue;
            }
            $label = (string) $item;
            foreach ($source['options'] ?? [] as $option) {
                if (\is_array($option) && (string) ($option['value'] ?? '') === $label) {
                    $label = (string) $option['label'];

                    break;
                }
            }
            $labels[] = $label;
        }

        return implode(', ', $labels);
    }
}
