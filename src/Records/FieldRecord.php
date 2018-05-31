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

use Solspace\Commons\Records\SerializableActiveRecord;
use Solspace\Freeform\Freeform;
use Solspace\Freeform\Library\Composer\Components\AbstractField;
use Solspace\Freeform\Library\Composer\Components\FieldInterface;
use Solspace\Freeform\Library\Helpers\HashHelper;

/**
 * Class Freeform_FieldRecord
 *
 * @property int    $id
 * @property string $type
 * @property string $handle
 * @property string $label
 * @property bool   $required
 * @property string $instructions
 * @property array  $metaProperties
 */
class FieldRecord extends SerializableActiveRecord
{
    const TABLE = '{{%freeform_fields}}';

    const RESERVED_FIELD_KEYWORDS = [
        'id',
        'title',
        'incrementalId',
        'statusId',
        'formId',
        'token',
        'ip',
        'isSpam',
        'dateCreated',
        'dateUpdated',
        'uid',
    ];

    /**
     * Returns the name of the associated database table.
     *
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return FieldRecord
     */
    public static function create(): FieldRecord
    {
        $field       = new self();
        $field->type = AbstractField::TYPE_TEXT;

        return $field;
    }

    /**
     * Returns whether the current user can edit the element.
     *
     * @return bool
     */
    public function isEditable(): bool
    {
        return true;
    }

    /**
     * @return string
     */
    public function getHash(): string
    {
        return HashHelper::hash($this->id);
    }

    /**
     * Depending on the field type - return its column type for the database
     *
     * @return string
     */
    public function getColumnType(): string
    {
        $columnType = 'varchar(100)';

        switch ($this->type) {
            case FieldInterface::TYPE_CHECKBOX_GROUP:
            case FieldInterface::TYPE_MULTIPLE_SELECT:
            case FieldInterface::TYPE_EMAIL:
            case FieldInterface::TYPE_TEXTAREA:
                $columnType = 'text';

                break;

            case FieldInterface::TYPE_HIDDEN:
                $columnType = 'varchar(250)';

                break;
        }

        return $columnType;
    }

    /**
     * @inheritDoc
     */
    public function rules(): array
    {
        return [
            [['handle'], 'unique'],
            [['handle'], 'checkReservedKeywords'],
        ];
    }

    /**
     * Validates an attribute to see if it's a reserved keyword or not
     *
     * @param $attribute
     */
    public function checkReservedKeywords($attribute)
    {
        $keyword = $this->{$attribute};

        if (\in_array($keyword, self::RESERVED_FIELD_KEYWORDS, true)) {
            $this->addError(
                $attribute,
                Freeform::t(
                    'The handle "{handle}" is a reserved keyword and cannot be used.',
                    ['handle' => $keyword, 'keywords' => implode('", "', self::RESERVED_FIELD_KEYWORDS)]
                )
            );
        }
    }

    /**
     * @inheritDoc
     */
    protected function getSerializableFields(): array
    {
        return [
            'metaProperties',
        ];
    }
}
