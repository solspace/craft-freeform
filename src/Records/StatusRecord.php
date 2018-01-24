<?php
/**
 * Freeform for Craft
 *
 * @package       Solspace:Freeform
 * @author        Solspace, Inc.
 * @copyright     Copyright (c) 2008-2017, Solspace, Inc.
 * @link          https://solspace.com/craft/freeform
 * @license       https://solspace.com/software/license-agreement
 */

namespace Solspace\Freeform\Records;

use craft\db\ActiveRecord;

/**
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property string $color
 * @property int    $isDefault
 * @property int    $sortOrder
 */
class StatusRecord extends ActiveRecord
{
    const TABLE     = '{{%freeform_statuses}}';
    const TABLE_STD = 'freeform_statuses';

    /**
     * @return array
     */
    public static function getAllowedColors(): array
    {
        return [
            'green',
            'blue',
            'yellow',
            'orange',
            'red',
            'pink',
            'purple',
            'turquoise',
            'light',
            'grey',
            'black',
        ];
    }

    /**
     * @return StatusRecord
     */
    public static function create(): StatusRecord
    {
        $colors = self::getAllowedColors();
        shuffle($colors);
        $randomColor = reset($colors);

        $field        = new static();
        $field->color = $randomColor;

        return $field;
    }

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @inheritDoc
     */
    public function rules(): array
    {
        return [
            [['handle'], 'unique'],
            [['name', 'handle'], 'required'],
        ];
    }
}
