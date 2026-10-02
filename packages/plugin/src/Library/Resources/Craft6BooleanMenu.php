<?php

namespace Solspace\Freeform\Library\Resources;

use CraftCms\Cms\Cp\Components\Combobox;
use CraftCms\Cms\Cp\SelectOptions;
use CraftCms\Cms\Support\Env;
use CraftCms\Cms\Support\Facades\InputNamespace;
use CraftCms\Cms\Support\Html;

use function CraftCms\Cms\t;

final class Craft6BooleanMenu
{
    public static function render(array $config): string
    {
        $id = InputNamespace::namespaceId($config['id']);
        $rawValue = $config['value'] ?? '0';
        $value = \is_string($rawValue) && str_starts_with($rawValue, '$')
            ? $rawValue
            : (Env::normalizeBooleanValue($rawValue) ? '1' : '0');
        $options = [
            self::option('1', t('Enabled'), true),
            self::option('0', t('Disabled'), false),
        ];

        if ($config['includeEnvVars'] ?? false) {
            foreach (SelectOptions::getBooleanEnvOptions() as $group) {
                $options[] = [
                    'type' => 'optgroup',
                    'label' => $group['label'],
                    'options' => $group['options']->map(static function (array $option): array {
                        $enabled = '1' === $option['data']['boolean'];

                        return self::option($option['value'], $option['label'], $enabled, true);
                    })->all(),
                ];
            }
        }

        $flatOptions = [];
        foreach ($options as $option) {
            array_push($flatOptions, ...($option['options'] ?? [$option]));
        }
        if (!\in_array($value, array_column($flatOptions, 'value'), true)) {
            // Preserve configured env references even when missing locally.
            $option = self::option($value, $value, Env::parseBoolean($value) ?? false, true);
            $options[] = $option;
            $flatOptions[] = $option;
        }

        $enabled = Env::parseBoolean($value) ?? false;
        $disabled = (bool) ($config['disabled'] ?? false);
        $selectOptions = '';
        foreach ($flatOptions as $option) {
            $selectOptions .= Html::tag('option', Html::encode($option['label']), [
                'value' => $option['value'],
                'selected' => $option['value'] === $value,
            ]);
        }

        // Keep a real select as the form/toggle owner for legacy Twig pages.
        $select = Html::tag('select', $selectOptions, [
            'id' => "{$id}-value",
            'name' => InputNamespace::namespaceInputName($config['name']),
            'hidden' => true,
            'disabled' => $disabled,
            'data' => [
                'boolean-menu' => true,
                'boolean' => $enabled ? 'true' : 'false',
                'target' => $config['toggle'] ?? null,
                'reverse-target' => $config['reverseToggle'] ?? null,
                'target-prefix' => false,
            ],
        ]);
        $combobox = Combobox::make()
            ->id($id)
            ->value($value)
            ->options($options)
            ->requireOptionMatch()
            ->disabled($disabled)
            ->required((bool) ($config['required'] ?? false))
            ->attributes(['aria' => [
                'label' => $config['label'] ?? null,
                'invalid' => !empty($config['errors']) ? 'true' : null,
            ]])
            ->toHtml()
        ;
        $indicator = Html::tag('span', Html::tag('craft-indicator', '', [
            'variant' => $enabled ? 'success' : 'empty',
        ]), ['class' => 'freeform-boolean-menu-status', 'aria' => ['hidden' => 'true']]);

        return Html::tag('div', $select.$combobox.$indicator, ['class' => 'freeform-boolean-menu']);
    }

    private static function option(string $value, string $label, bool $enabled, bool $hint = false): array
    {
        return [
            'value' => $value,
            'label' => $label,
            'data' => [
                'boolean' => $enabled ? '1' : '0',
                'indicator' => ['variant' => $enabled ? 'success' : 'empty'],
                ...($hint ? ['hint' => $enabled ? t('Enabled') : t('Disabled')] : []),
            ],
        ];
    }
}
