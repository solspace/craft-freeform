<?php

namespace Solspace\Freeform\Library\Forms\Merge;

use Solspace\Freeform\Fields\FieldInterface;
use Solspace\Freeform\Fields\Implementations\TextareaField;
use Solspace\Freeform\Freeform;

final class TextRules
{
    public const EXAMPLE_LIMIT = 3;
    public const MAX_RULES = 10;
    public const MAX_INPUTS = 10;

    private const SEPARATORS = [
        'space' => ' ',
        'comma' => ', ',
        'comma-only' => ',',
        'hyphen' => ' - ',
        'slash' => ' / ',
        'none' => '',
        'newline' => "\n",
    ];

    public static function supportsField(FieldInterface $field): bool
    {
        return FieldMapping::isText($field) && FieldMapping::canAdd($field);
    }

    public static function validate(array $input, array $from, array $to, array $map): array
    {
        if (!array_is_list($input) || \count($input) > self::MAX_RULES) {
            throw new \DomainException(Freeform::t('Use up to {count} text rules per merge.', ['count' => self::MAX_RULES]));
        }

        $sourceIds = array_fill_keys(array_keys($map), true);
        $targetIds = array_fill_keys(array_values($map), true);
        $rules = [];
        foreach ($input as $rule) {
            if (!\is_array($rule) || !\in_array($rule['type'] ?? null, ['split', 'combine'], true)) {
                throw new \DomainException(Freeform::t('Choose Split or Combine for each text rule.'));
            }
            $split = 'split' === $rule['type'];
            $inputs = self::validateFields($rule['inputs'] ?? null, $from, $sourceIds, $split ? 1 : 2, $split ? 1 : self::MAX_INPUTS);
            $outputs = self::validateFields($rule['outputs'] ?? null, $to, $targetIds, $split ? 2 : 1, $split ? 2 : 1);
            $format = $rule['format'] ?? null;
            if (!\in_array($format, $split ? ['first', 'last'] : array_keys(self::SEPARATORS), true)) {
                throw new \DomainException(Freeform::t('Choose a valid split rule or separator.'));
            }
            if ('newline' === $format && !$to[$outputs[0]] instanceof TextareaField) {
                throw new \DomainException(Freeform::t('Choose a textarea to combine values on separate lines.'));
            }
            $normalized = ['type' => $rule['type'], 'inputs' => $inputs, 'outputs' => $outputs, 'format' => $format];
            if ($split) {
                $singleWord = $rule['singleWord'] ?? 'first';
                if (!\in_array($singleWord, ['first', 'second'], true)) {
                    throw new \DomainException(Freeform::t('Choose where single-word values go.'));
                }
                if ('second' === $singleWord) {
                    $normalized['singleWord'] = $singleWord;
                }
            }
            $rules[] = $normalized;
        }

        return $rules;
    }

    public static function apply(array $rule, array $record): array
    {
        $values = array_map(
            static fn ($id) => preg_replace('/^\s+|\s+$/u', '', (string) ($record['value_'.$id] ?? '')) ?? trim((string) ($record['value_'.$id] ?? '')),
            $rule['inputs'],
        );
        if ('combine' === $rule['type']) {
            $separator = self::SEPARATORS[$rule['format']];
            $combined = implode($separator, array_filter($values, static fn (string $part) => '' !== $part));

            return [$combined];
        }

        [$value] = $values;
        $pattern = 'first' === $rule['format'] ? '/^(\S+)\s+([\s\S]+)$/u' : '/^(\S(?:[\s\S]*\S)?)\s+(\S+)$/u';
        if (1 === preg_match($pattern, $value, $matches)) {
            return [rtrim($matches[1]), $matches[2]];
        }

        return 'second' === ($rule['singleWord'] ?? 'first') ? ['', $value] : [$value, ''];
    }

    public static function inputIds(array $rules): array
    {
        return $rules ? array_merge(...array_column($rules, 'inputs')) : [];
    }

    public static function directMappings(array $mapping, array $rules): array
    {
        $anchors = [];
        foreach ($rules as $rule) {
            if (!\is_array($rule) || !\is_array($rule['inputs'] ?? null)) {
                throw new \DomainException(Freeform::t('Choose and configure each text rule in its mapping row.'));
            }
            $anchor = $rule['inputs'][0] ?? null;
            $type = $rule['type'] ?? null;
            if ((!\is_int($anchor) && !\is_string($anchor)) || !ctype_digit((string) $anchor)
                || !\in_array($type, ['split', 'combine'], true) || isset($anchors[$anchor])
                || ($mapping[$anchor] ?? null) !== 'rule:'.$type) {
                throw new \DomainException(Freeform::t('Choose and configure each text rule in its mapping row.'));
            }
            $anchors[$anchor] = true;
        }

        foreach ($mapping as $id => $action) {
            if (\in_array($action, ['rule:split', 'rule:combine'], true)) {
                if (!isset($anchors[$id])) {
                    throw new \DomainException(Freeform::t('Choose and configure each text rule in its mapping row.'));
                }
                $mapping[$id] = 'skip';
            }
        }

        foreach ($rules as $rule) {
            if ('combine' !== $rule['type']) {
                continue;
            }
            foreach (\array_slice($rule['inputs'], 1) as $id) {
                if ((\is_int($id) || \is_string($id)) && isset($mapping[$id]) && !isset($anchors[$id])) {
                    $mapping[$id] = 'skip';
                }
            }
        }

        return $mapping;
    }

    public static function examples(array $rules, array $record, array $examples): array
    {
        foreach ($rules as $index => $rule) {
            if (\count($examples[$index] ?? []) >= self::EXAMPLE_LIMIT) {
                continue;
            }
            $before = array_map(static fn ($id) => (string) ($record['value_'.$id] ?? ''), $rule['inputs']);
            $after = self::apply($rule, $record);
            if (!array_filter($after, static fn (string $value) => '' !== $value)) {
                continue;
            }
            $shorten = static fn (string $value): string => mb_strimwidth($value, 0, 120, '…');
            $example = ['before' => array_map($shorten, $before), 'after' => array_map($shorten, $after)];
            $saved = array_map(static fn (array $sample) => ['before' => $sample['before'], 'after' => $sample['after']], $examples[$index] ?? []);
            if (!\in_array($example, $saved, true)) {
                $examples[$index][] = $example + ['id' => (int) $record['id']];
            }
        }

        return $examples;
    }

    private static function validateFields(mixed $values, array $fields, array &$used, int $minimum, int $maximum): array
    {
        if (!\is_array($values) || !array_is_list($values) || \count($values) < $minimum || \count($values) > $maximum) {
            throw new \DomainException(Freeform::t('Choose all fields required by each text rule.'));
        }
        $ids = [];
        foreach ($values as $value) {
            if ((!\is_int($value) && !\is_string($value)) || !ctype_digit((string) $value) || !isset($fields[$value]) || !self::supportsField($fields[$value])) {
                throw new \DomainException(Freeform::t('Split and Combine only support text fields on the selected forms.'));
            }
            if (isset($used[$value])) {
                throw new \DomainException(Freeform::t('A field in a text rule can’t also be used in another rule or direct mapping.'));
            }
            $used[$value] = true;
            $ids[] = (int) $value;
        }

        return $ids;
    }
}
