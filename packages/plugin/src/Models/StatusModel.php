<?php

/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2026, Solspace, Inc.
 *
 * @see           https://docs.solspace.com/craft/freeform
 *
 * @license       https://docs.solspace.com/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use Solspace\Freeform\Records\StatusRecord;

/**
 * Class Freeform_FieldModel.
 *
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property bool   $isDefault
 * @property string $color
 * @property int    $sortOrder
 */
class StatusModel extends Model implements \Stringable, \JsonSerializable
{
    public ?int $id = null;
    public string $name = '';
    public string $handle = '';
    public string $color = '';
    public int $sortOrder = 0;

    private static array $hexMap = [
        'green' => '#27AE60',
        'orange' => '#F2842D',
        'red' => '#D0021B',
        'yellow' => '#F1C40E',
        'pink' => '#FF50F2',
        'purple' => '#9B59B6',
        'blue' => '#0D99F2',
        'turquoise' => '#2CE0BD',
        'light' => '#CCD1D6',
        'grey' => '#98A3AE',
        'black' => '#32475E',
    ];

    private static array $craft5HexMap = [
        'red' => '#dc2626',
        'orange' => '#fb923c',
        'amber' => '#f59e0b',
        'yellow' => '#eab308',
        'lime' => '#84cc16',
        'green' => '#16a34a',
        'emerald' => '#10b981',
        'teal' => '#11a697',
        'cyan' => '#06b6d4',
        'sky' => '#0ea5e9',
        'blue' => '#2563eb',
        'indigo' => '#6366f1',
        'violet' => '#8b5cf6',
        'purple' => '#a855f7',
        'fuchsia' => '#d946ef',
        'pink' => '#ec4899',
        'rose' => '#f43f5e',
        'white' => '#ffffff',
        'gray' => '#606d7b',
        'black' => '#000000',
    ];

    public function __toString()
    {
        return $this->name;
    }

    public static function create(): self
    {
        $colors = StatusRecord::getAllowedColors();
        shuffle($colors);
        $randomColor = reset($colors);

        $field = new static();
        $field->color = $randomColor;

        return $field;
    }

    public function getColorHex(): string
    {
        if (version_compare(\Craft::$app->getVersion(), '5', '>=')) {
            return self::$craft5HexMap[$this->color] ?? self::$hexMap[$this->color] ?? '#FFFFFF';
        }

        return self::$hexMap[$this->color] ?? '#FFFFFF';
    }

    /** @return array<string, string> */
    public function getColorPalette(): array
    {
        $palette = [];
        foreach (StatusRecord::getAllowedColors() as $color) {
            $palette[$color] = (new self(['color' => $color]))->getColorHex();
        }

        return $palette;
    }

    public function safeAttributes(): array
    {
        return [
            'name',
            'handle',
            'isDefault',
            'color',
            'sortOrder',
        ];
    }

    public function jsonSerialize(): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'handle' => $this->handle,
            'color' => $this->color,
        ];
    }
}
