<?php

namespace Solspace\Freeform\Records\Pro;

use craft\db\ActiveRecord;
use Solspace\Freeform\Records\FormRecord;
use yii\db\ActiveQuery;

/**
 * Class ExportProfileRecord.
 *
 * @property int    $id
 * @property int    $formId
 * @property string $name
 * @property int    $limit
 * @property string $dateRange
 * @property string $rangeStart
 * @property string $rangeEnd
 * @property array  $fields
 * @property array  $filters
 * @property array  $statuses
 */
class ExportProfileRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_export_profiles}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|FormRecord
     */
    public function getForm(): ActiveQuery
    {
        return $this->hasOne(FormRecord::class, ['formId' => 'id']);
    }

    /**
     * {@inheritDoc}
     */
    public function rules(): array
    {
        return [
            [['name'], 'unique'],
            [['name', 'statuses'], 'required'],
            [['rangeStart', 'rangeEnd'], 'validateDate'],
        ];
    }

    public function validateDate($attribute)
    {
        $value = $this->getAttribute($attribute);

        try {
            new \DateTime($value);
        } catch (\Exception $exception) {
            $this->addError($attribute, 'This is not a valid date');
        }
    }
}
