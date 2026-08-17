<?php

namespace Solspace\Freeform\Services\Headless\Manifest;

use Solspace\Freeform\Fields\FieldInterface;

class ManifestExtensionResolver
{
    private const EXTENSION_MAP = [
        FieldInterface::TYPE_DATETIME => 'datetime',
        FieldInterface::TYPE_FILE => 'file-upload',
        FieldInterface::TYPE_FILE_DRAG_AND_DROP => 'file-dnd',
        FieldInterface::TYPE_TABLE => 'table',
        FieldInterface::TYPE_SIGNATURE => 'signature',
        FieldInterface::TYPE_RATING => 'rating',
        FieldInterface::TYPE_CARDS => 'cards',
        FieldInterface::TYPE_CALCULATION => 'calculation',
        'stripe' => 'payment.stripe',
        'square' => 'payment.square',
    ];

    public function resolveRenderer(string $type): string
    {
        return match ($type) {
            FieldInterface::TYPE_CHECKBOX_GROUP => 'checkboxes',
            FieldInterface::TYPE_RADIO_GROUP => 'radios',
            FieldInterface::TYPE_MULTIPLE_SELECT => 'multiple-select',
            FieldInterface::TYPE_SELECT => 'dropdown',
            FieldInterface::TYPE_FILE_DRAG_AND_DROP => 'file-dnd',
            FieldInterface::TYPE_RICH_TEXT => 'rich-text',
            FieldInterface::TYPE_HTML => 'html',
            'stripe' => 'payment.stripe',
            'square' => 'payment.square',
            default => $type,
        };
    }

    public function resolveExtension(string $type): ?string
    {
        return self::EXTENSION_MAP[$type] ?? null;
    }

    /**
     * @param array<string, array<string, mixed>> $fields
     *
     * @return array<int, array<string, mixed>>
     */
    public function resolveRequiredExtensions(array $fields): array
    {
        $extensions = [];
        foreach ($fields as $field) {
            $extension = $field['frontend']['extension'] ?? null;
            if (!$extension) {
                continue;
            }

            $extensions[$extension] = [
                'name' => $extension,
                'package' => '@solspace/freeform-extensions',
                'version' => str_starts_with($extension, 'payment.') ? '^0.1.0' : '^5.0.0',
                'severity' => \in_array($field['type'] ?? '', [FieldInterface::TYPE_CALCULATION, 'stripe', 'square'], true) ? 'error' : 'warning',
                'fallback' => FieldInterface::TYPE_FILE === ($field['type'] ?? '') ? 'native' : null,
            ];
        }

        return array_values($extensions);
    }
}
