<?php

namespace Solspace\Freeform\Records\AbTests;

use craft\db\ActiveRecord;
use yii\db\ActiveQuery;

/**
 * @property int    $id
 * @property string $name
 * @property string $handle
 * @property string $description
 * @property string $startDate
 * @property string $endDate
 */
class AbTestRecord extends ActiveRecord
{
    public const TABLE = '{{%freeform_ab_tests}}';

    public static function tableName(): string
    {
        return self::TABLE;
    }

    public function rules(): array
    {
        return [
            [['handle'], 'unique'],
        ];
    }

    public function getVariants(): ActiveQuery
    {
        return $this->hasMany(AbTestVariantRecord::class, ['abTestId' => 'id']);
    }
}
