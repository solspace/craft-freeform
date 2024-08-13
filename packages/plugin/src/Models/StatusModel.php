<?php
/**
 * Freeform for Craft CMS.
 *
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2024, Solspace, Inc.
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
class StatusModel extends Model implements \JsonSerializable
{
    public ?int $id = null;
    public string $name = '';
    public string $handle = '';
    public string $color = 'gray';
    public int $sortOrder = 0;

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
        return $this->color;
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
