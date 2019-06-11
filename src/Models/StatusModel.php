<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2019, Solspace, Inc.
 * @link          http://docs.solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Models;

use craft\base\Model;
use Solspace\Freeform\Records\StatusRecord;

/**
 * Class Freeform_FieldModel
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
    /** @var string[] */
    private static $hexMap = [
        'green'     => '#27AE60',
        'orange'    => '#F2842D',
        'red'       => '#D0021B',
        'yellow'    => '#F1C40E',
        'pink'      => '#FF50F2',
        'purple'    => '#9B59B6',
        'blue'      => '#0D99F2',
        'turquoise' => '#2CE0BD',
        'light'     => '#CCD1D6',
        'grey'      => '#98A3AE',
        'black'     => '#32475E',
    ];

    /** @var int */
    public $id;

    /** @var string */
    public $name;

    /** @var string */
    public $handle;

    /** @var bool */
    public $isDefault;

    /** @var string */
    public $color;

    /** @var int */
    public $sortOrder;

    /**
     * @return StatusModel
     */
    public static function create(): StatusModel
    {
        $colors = StatusRecord::getAllowedColors();
        shuffle($colors);
        $randomColor = reset($colors);

        $field        = new static();
        $field->color = $randomColor;

        return $field;
    }

    /**
     * @return string
     */
    public function __toString()
    {
        return $this->name;
    }

    /**
     * @return string
     */
    public function getColorHex(): string
    {
        return self::$hexMap[$this->color] ?? '#FFFFFF';
    }

    /**
     * @inheritDoc
     */
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

    /**
     * Specify data which should be serialized to JSON
     */
    public function jsonSerialize()
    {
        return [
            'id'        => (int) $this->id,
            'name'      => $this->name,
            'handle'    => $this->handle,
            'isDefault' => (bool) $this->isDefault,
            'color'     => $this->color,
        ];
    }
}
