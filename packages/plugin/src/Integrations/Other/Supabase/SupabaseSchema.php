<?php

namespace Solspace\Freeform\Integrations\Other\Supabase;

use Solspace\Freeform\Library\Exceptions\Integrations\IntegrationException;
use Solspace\Freeform\Library\Integrations\DataObjects\FieldObject;

class SupabaseSchema
{
    public static function identifier(string $value): string
    {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,62}$/D', $value)) {
            throw new IntegrationException('Use Supabase schema, table, and column names containing only letters, numbers, and underscores, beginning with a letter or underscore.');
        }

        return $value;
    }

    public static function tables(array $document): array
    {
        $tables = [];
        foreach ($document['definitions'] ?? [] as $table => $definition) {
            if (\is_array($definition) && isset($definition['properties']) && \is_array($definition['properties'])
                && isset($document['paths']['/'.$table]['post'])
                && preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,62}$/D', $table)
            ) {
                $tables[] = $table;
            }
        }
        sort($tables, \SORT_NATURAL | \SORT_FLAG_CASE);

        return $tables;
    }

    public static function fields(array $document, string $table, string $category): array
    {
        if (!\in_array($table, self::tables($document), true)) {
            throw new IntegrationException('The selected Supabase table is not exposed for inserts. Check the schema and table grants.');
        }

        $definition = $document['definitions'][$table];
        $fields = [];
        foreach ($definition['properties'] as $name => $property) {
            if (!\is_array($property)) {
                throw new IntegrationException('Supabase returned an invalid column definition.');
            }
            if (($property['readOnly'] ?? false) || !preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,62}$/D', $name)) {
                continue;
            }
            $format = $property['format'] ?? '';
            $type = match (true) {
                \in_array($format, ['json', 'jsonb'], true) => Supabase::TYPE_JSON,
                'array' === ($property['type'] ?? '') => FieldObject::TYPE_ARRAY,
                'integer' === ($property['type'] ?? '') => FieldObject::TYPE_NUMERIC,
                'number' === ($property['type'] ?? '') => FieldObject::TYPE_FLOAT,
                'boolean' === ($property['type'] ?? '') => FieldObject::TYPE_BOOLEAN,
                'date' === $format => FieldObject::TYPE_DATE,
                \in_array($format, ['date-time', 'timestamp with time zone', 'timestamp without time zone', 'timestamptz', 'timestamp'], true) => FieldObject::TYPE_DATETIME,
                'string' === ($property['type'] ?? '') => FieldObject::TYPE_STRING,
                default => null,
            };
            if (null === $type) {
                continue;
            }

            $options = null;
            if (isset($property['enum']) && \is_array($property['enum'])) {
                $options = array_map(static fn ($value) => ['key' => $value, 'label' => (string) $value], $property['enum']);
            }
            $required = \in_array($name, $definition['required'] ?? [], true)
                && !\array_key_exists('default', $property)
                // PostgREST does not describe sequence/identity defaults reliably.
                && !str_contains($property['description'] ?? '', '<pk/>');
            $fields[] = new FieldObject($name, $name, $type, $category, $required, $options);
        }

        return $fields;
    }
}
