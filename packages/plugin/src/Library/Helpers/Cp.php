<?php

namespace Solspace\Freeform\Library\Helpers;

use craft\base\Statusable;
use craft\enums\Color;
use craft\helpers\Cp as CraftCp;
use craft\helpers\Html;

class Cp extends CraftCp
{
    public static function componentStatusLabelHtml(Statusable $component): ?string
    {
        $status = $component->getStatus();

        if (!$status) {
            return null;
        }

        $config = $component::statuses()[$status] ?? [];
        if (\is_string($config)) {
            $config = ['label' => $config];
        }
        $config['color'] ??= Color::tryFromStatus($status) ?? Color::Gray;
        $config['label'] ??= match ($status) {
            'draft' => \Craft::t('app', 'Draft'),
            default => ucfirst($status),
        };
        $config['indicatorClass'] = match ($status) {
            'pending', 'off', 'suspended', 'expired', 'disabled', 'inactive' => $status,
            default => $config['color']->value,
        };

        return static::statusLabelHtml($config);
    }

    public static function statusLabelHtml(array $config = []): ?string
    {
        $config += [
            'color' => Color::Gray->value,
            'icon' => null,
            'label' => null,
            'indicatorClass' => null,
        ];

        if ($config['color'] instanceof Color) {
            $config['color'] = $config['color']->value;
        }

        if ($config['icon']) {
            $html = Html::tag('span', CraftCp::iconSvg($config['icon']), [
                'class' => ['cp-icon', 'puny', $config['color']],
            ]);
        } else {
            $html = self::statusIndicatorHtml($config['color'], [
                'label' => null,
                'class' => $config['indicatorClass'] ?? $config['color'],
            ]);
        }

        if ($config['label']) {
            $html .= ' '.Html::tag('span', Html::encode($config['label']), ['class' => 'ff-status-label-text']);
        }

        return Html::tag('span', $html, [
            'class' => array_filter([
                'ff-status-label',
                $config['color'],
            ]),
        ]);
    }

    public static function statusIndicatorHtml(string $status, array $attributes = []): ?string
    {
        $attributes += [
            'color' => null,
            'label' => ucfirst($status),
            'class' => $status,
        ];

        if ('draft' === $status) {
            return Html::tag('span', '', [
                'data' => ['icon' => 'draft'],
                'class' => 'icon',
                'role' => 'img',
                'aria' => [
                    'label' => \sprintf(
                        '%s %s',
                        \Craft::t('app', 'Status:'),
                        $attributes['label'] ?? \Craft::t('app', 'Draft'),
                    ),
                ],
            ]);
        }

        if ($attributes['color'] instanceof Color) {
            $attributes['color'] = $attributes['color']->value;
        }

        $options = [
            'class' => array_filter([
                'ff-status',
                $attributes['class'],
                $attributes['color'],
            ]),
        ];

        if (null !== $attributes['label']) {
            $options['role'] = 'img';
            $options['aria']['label'] = \sprintf('%s %s', \Craft::t('app', 'Status:'), $attributes['label']);
        }

        return Html::tag('span', '', $options);
    }
}
