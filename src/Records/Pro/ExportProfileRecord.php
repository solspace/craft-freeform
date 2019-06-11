<?php

namespace Solspace\Freeform\Records\Pro;

use craft\db\ActiveRecord;
use Solspace\Freeform\Records\FormRecord;
use yii\db\ActiveQuery;

/**
 * Class ExportProfileRecord
 *
 * @property int    $id
 * @property int    $formId
 * @property string $name
 * @property int    $limit
 * @property string $dateRange
 * @property array  $fields
 * @property array  $filters
 * @property array  $statuses
 */
class ExportProfileRecord extends ActiveRecord
{
    const TABLE = '{{%freeform_export_profiles}}';

    /**
     * @return string
     */
    public static function tableName(): string
    {
        return self::TABLE;
    }

    /**
     * @return ActiveQuery|FormRecord
     */
    public function getForm(): ActiveQuery
    {
        return $this->hasOne(FormRecord::TABLE, ['formId' => 'id']);
    }

    /**
     * @inheritDoc
     */
    public function rules(): array
    {
        return [
            [['name'], 'unique'],
            [['name', 'statuses'], 'required'],
        ];
    }
}
